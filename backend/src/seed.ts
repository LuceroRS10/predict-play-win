import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // Create Super Admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@predictplaywin.com' },
    update: {},
    create: {
      username: 'SuperAdmin',
      email: 'admin@predictplaywin.com',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      eloRating: 1000,
    },
  });
  console.log('✅ Super Admin created (admin@predictplaywin.com / admin123)');

  // Seed leagues
  const leagues = [
    { name: 'La Liga', apiFootballId: 140, country: 'Spain' },
    { name: 'Premier League', apiFootballId: 39, country: 'England' },
    { name: 'Serie A', apiFootballId: 135, country: 'Italy' },
    { name: 'Ligue 1', apiFootballId: 61, country: 'France' },
  ];

  for (const league of leagues) {
    await prisma.league.upsert({
      where: { apiFootballId: league.apiFootballId },
      update: { name: league.name },
      create: league,
    });
  }
  console.log('✅ Leagues seeded');

  // Seed admin settings
  const settings = [
    { key: 'challenge_max_active', value: '3', label: 'Max active challenges per player' },
    { key: 'challenge_expiry_hours', value: '24', label: 'Challenge expiry time (hours)' },
    { key: 'challenge_elo_diminish_window_days', value: '21', label: 'Challenge ELO diminish window (days)' },
    { key: 'challenge_elo_match2_multiplier', value: '0.80', label: 'ELO multiplier for 2nd challenge match' },
    { key: 'challenge_elo_match3_multiplier', value: '0.50', label: 'ELO multiplier for 3rd challenge match' },
    { key: 'challenge_elo_match4plus_multiplier', value: '0.25', label: 'ELO multiplier for 4th+ challenge match' },
    { key: 'tournament_elo_multiplier', value: '1.00', label: 'Tournament ELO multiplier' },
    { key: 'prediction_lock_minutes_before', value: '5', label: 'Lock predictions (minutes before kickoff)' },
    { key: 'elo_starting_rating', value: '1000', label: 'Starting ELO rating' },
    { key: 'elo_k_factor', value: '32', label: 'ELO K-factor' },
  ];

  for (const setting of settings) {
    await prisma.adminSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, label: setting.label },
      create: setting,
    });
  }
  console.log('✅ Admin settings seeded');

  console.log('\n🎉 Seed complete!');
  console.log('Login: admin@predictplaywin.com / admin123');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
