import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { footballApiService } from './football-api.service';
import { scoreMatchday, generateKnockoutBracket } from './tournament.service';
import { scoreChallenge, expirePendingChallenges } from './challenge.service';

const prisma = new PrismaClient();

/**
 * Initialize all cron jobs
 */
export function initCronJobs(): void {
  // Every 5 minutes: Check for finished fixtures and auto-score
  cron.schedule('*/5 * * * *', async () => {
    console.log('[CRON] Checking for fixture updates...');
    try {
      // Get all in-progress matchdays
      const matchdays = await prisma.matchday.findMany({
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
        include: { tournament: { include: { league: true } } },
      });

      for (const matchday of matchdays) {
        // Check if any fixtures have started (update status to IN_PROGRESS)
        const startedFixtures = await prisma.fixture.count({
          where: {
            matchdayId: matchday.id,
            kickoffTime: { lte: new Date() },
            status: 'SCHEDULED',
          },
        });

        if (startedFixtures > 0 && matchday.status === 'OPEN') {
          await prisma.matchday.update({
            where: { id: matchday.id },
            data: { status: 'IN_PROGRESS' },
          });
        }

        // Lock predictions for started matches
        await prisma.fixture.updateMany({
          where: {
            matchdayId: matchday.id,
            kickoffTime: { lte: new Date() },
            status: 'SCHEDULED',
          },
          data: { status: 'LIVE' },
        });

        // Update results from API
        const result = await footballApiService.updateFixtureResults(matchday.id);

        if (result.allFinished) {
          console.log(`[CRON] Matchday ${matchday.id} all finished, scoring...`);
          await scoreMatchday(matchday.id);

          // Check if group stage is complete, advance to knockout
          const tournament = matchday.tournament;
          const allMatchdays = await prisma.matchday.findMany({
            where: { tournamentId: tournament.id, isKnockout: false },
          });

          const allComplete = allMatchdays.every(m => m.status === 'COMPLETED');
          if (allComplete && tournament.status === 'GROUP_STAGE') {
            // Check for next upcoming group matchday first
            const nextMatchday = await prisma.matchday.findFirst({
              where: { tournamentId: tournament.id, status: 'UPCOMING' },
              orderBy: { roundNumber: 'asc' },
            });

            if (nextMatchday) {
              // Open next group matchday
              await prisma.matchday.update({
                where: { id: nextMatchday.id },
                data: { status: 'OPEN' },
              });
              await prisma.tournament.update({
                where: { id: tournament.id },
                data: { currentMatchday: nextMatchday.roundNumber },
              });
            } else {
              // All group matchdays done, no more upcoming → advance to knockout!
              console.log(`[CRON] All group matchdays complete for tournament ${tournament.id}, generating knockout bracket...`);
              await generateKnockoutBracket(tournament.id);
              console.log(`[CRON] Knockout bracket generated for tournament ${tournament.id}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('[CRON] Fixture update error:', error);
    }
  });

  // Every hour: Expire pending challenges
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Expiring pending challenges...');
    try {
      const count = await expirePendingChallenges();
      if (count > 0) console.log(`[CRON] Expired ${count} challenges`);
    } catch (error) {
      console.error('[CRON] Challenge expiry error:', error);
    }
  });

  // Every 10 minutes: Score completed challenges
  cron.schedule('*/10 * * * *', async () => {
    console.log('[CRON] Checking for completed challenges...');
    try {
      const activeChallenges = await prisma.challenge.findMany({
        where: { status: { in: ['ACCEPTED', 'IN_PROGRESS'] } },
        include: {
          predictions: { include: { fixture: true } },
        },
      });

      for (const challenge of activeChallenges) {
        // Check if all fixtures are finished
        const fixtures = challenge.predictions.map(p => p.fixture);
        const uniqueFixtures = [...new Map(fixtures.map(f => [f.id, f])).values()];
        const allFinished = uniqueFixtures.every(
          f => f.status === 'FINISHED' || f.status === 'POSTPONED' || f.status === 'CANCELLED'
        );

        if (allFinished && uniqueFixtures.length > 0) {
          await scoreChallenge(challenge.id);
        }
      }
    } catch (error) {
      console.error('[CRON] Challenge scoring error:', error);
    }
  });

  console.log('[CRON] All cron jobs initialized');
}
