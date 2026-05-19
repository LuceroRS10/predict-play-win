import axios, { AxiosInstance } from 'axios';
import { PrismaClient, FixtureStatus } from '@prisma/client';
import { config } from '../config';

const prisma = new PrismaClient();

class FootballApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: config.apiFootball.baseUrl,
      headers: {
        'x-apisports-key': config.apiFootball.key,
      },
    });
  }

  /**
   * Get all leagues supported by the platform
   */
  async getLeagues(): Promise<any[]> {
    // La Liga: 140, Premier League: 39, Serie A: 135, Ligue 1: 61
    const leagueIds = [140, 39, 135, 61];
    const results = [];

    for (const id of leagueIds) {
      try {
        const response = await this.api.get('/leagues', { params: { id } });
        if (response.data.response?.length > 0) {
          results.push(response.data.response[0]);
        }
      } catch (error) {
        console.error(`Failed to fetch league ${id}:`, error);
      }
    }

    return results;
  }

  /**
   * Sync league clubs from API to database
   */
  async syncLeagueTeams(apiLeagueId: number, season: number): Promise<void> {
    try {
      const response = await this.api.get('/teams', {
        params: { league: apiLeagueId, season },
      });

      const league = await prisma.league.findUnique({
        where: { apiFootballId: apiLeagueId },
      });

      if (!league) throw new Error(`League ${apiLeagueId} not found in database`);

      for (const team of response.data.response || []) {
        await prisma.club.upsert({
          where: { apiFootballId: team.team.id },
          update: {
            name: team.team.name,
            logoUrl: team.team.logo,
            shortName: team.team.code,
          },
          create: {
            name: team.team.name,
            apiFootballId: team.team.id,
            logoUrl: team.team.logo,
            shortName: team.team.code,
            leagueId: league.id,
          },
        });
      }
    } catch (error) {
      console.error(`Failed to sync teams for league ${apiLeagueId}:`, error);
      throw error;
    }
  }

  /**
   * Get fixtures for a specific league round
   */
  async getFixturesByRound(apiLeagueId: number, season: number, round: string): Promise<any[]> {
    try {
      const response = await this.api.get('/fixtures', {
        params: { league: apiLeagueId, season, round },
      });
      return response.data.response || [];
    } catch (error) {
      console.error(`Failed to fetch fixtures for round ${round}:`, error);
      throw error;
    }
  }

  /**
   * Get available rounds for a league/season
   */
  async getRounds(apiLeagueId: number, season: number): Promise<string[]> {
    try {
      const response = await this.api.get('/fixtures/rounds', {
        params: { league: apiLeagueId, season },
      });
      return response.data.response || [];
    } catch (error) {
      console.error('Failed to fetch rounds:', error);
      throw error;
    }
  }

  /**
   * Sync fixtures for a matchday from API to database
   */
  async syncMatchdayFixtures(matchdayId: string, apiLeagueId: number, season: number, round: number): Promise<void> {
    const roundString = `Regular Season - ${round}`;
    const apiFixtures = await this.getFixturesByRound(apiLeagueId, season, roundString);

    for (const apiFixture of apiFixtures) {
      const homeClub = await prisma.club.findUnique({
        where: { apiFootballId: apiFixture.teams.home.id },
      });
      const awayClub = await prisma.club.findUnique({
        where: { apiFootballId: apiFixture.teams.away.id },
      });

      if (!homeClub || !awayClub) continue;

      // Map API status to our status
      let status: FixtureStatus = 'SCHEDULED';
      const apiStatus = apiFixture.fixture.status.short;
      if (['1H', '2H', 'HT', 'ET', 'BT', 'P'].includes(apiStatus)) status = 'LIVE';
      else if (['FT', 'AET', 'PEN'].includes(apiStatus)) status = 'FINISHED';
      else if (['PST', 'SUSP'].includes(apiStatus)) status = 'POSTPONED';
      else if (['CANC', 'ABD'].includes(apiStatus)) status = 'CANCELLED';

      await prisma.fixture.upsert({
        where: {
          id: (await prisma.fixture.findFirst({
            where: { apiFootballFixtureId: apiFixture.fixture.id },
          }))?.id || 'nonexistent',
        },
        update: {
          homeScore: apiFixture.goals.home,
          awayScore: apiFixture.goals.away,
          status,
          kickoffTime: new Date(apiFixture.fixture.date),
        },
        create: {
          matchdayId,
          apiFootballFixtureId: apiFixture.fixture.id,
          homeClubId: homeClub.id,
          awayClubId: awayClub.id,
          kickoffTime: new Date(apiFixture.fixture.date),
          homeScore: apiFixture.goals.home,
          awayScore: apiFixture.goals.away,
          status,
        },
      });
    }
  }

  /**
   * Update live fixture results
   */
  async updateFixtureResults(matchdayId: string): Promise<{ allFinished: boolean; updated: number }> {
    const fixtures = await prisma.fixture.findMany({
      where: {
        matchdayId,
        status: { in: ['SCHEDULED', 'LIVE'] },
        isExcluded: false,
      },
    });

    let updated = 0;

    for (const fixture of fixtures) {
      if (!fixture.apiFootballFixtureId) continue;

      try {
        const response = await this.api.get('/fixtures', {
          params: { id: fixture.apiFootballFixtureId },
        });

        const apiFixture = response.data.response?.[0];
        if (!apiFixture) continue;

        let status: FixtureStatus = fixture.status;
        const apiStatus = apiFixture.fixture.status.short;
        if (['1H', '2H', 'HT', 'ET', 'BT', 'P'].includes(apiStatus)) status = 'LIVE';
        else if (['FT', 'AET', 'PEN'].includes(apiStatus)) status = 'FINISHED';
        else if (['PST', 'SUSP'].includes(apiStatus)) status = 'POSTPONED';
        else if (['CANC', 'ABD'].includes(apiStatus)) status = 'CANCELLED';

        await prisma.fixture.update({
          where: { id: fixture.id },
          data: {
            homeScore: apiFixture.goals.home,
            awayScore: apiFixture.goals.away,
            status,
            // Auto-exclude postponed/cancelled matches
            isExcluded: status === 'POSTPONED' || status === 'CANCELLED' ? true : fixture.isExcluded,
          },
        });

        updated++;
      } catch (error) {
        console.error(`Failed to update fixture ${fixture.id}:`, error);
      }
    }

    // Check if all non-excluded fixtures are finished
    const remaining = await prisma.fixture.count({
      where: {
        matchdayId,
        status: { notIn: ['FINISHED', 'POSTPONED', 'CANCELLED'] },
        isExcluded: false,
      },
    });

    return { allFinished: remaining === 0, updated };
  }

  /**
   * Get upcoming league round number
   */
  async getCurrentRound(apiLeagueId: number, season: number): Promise<number> {
    try {
      const response = await this.api.get('/fixtures/rounds', {
        params: { league: apiLeagueId, season, current: true },
      });
      const current = response.data.response?.[0];
      if (current) {
        const match = current.match(/Regular Season - (\d+)/);
        return match ? parseInt(match[1]) : 1;
      }
      return 1;
    } catch (error) {
      console.error('Failed to get current round:', error);
      return 1;
    }
  }
}

export const footballApiService = new FootballApiService();
