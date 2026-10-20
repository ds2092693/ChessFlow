import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/divyanshusharma/Chess4Nerds/packages/db/prisma/dev.db',
    },
  },
});

const INITIAL_PLAYERS = [
  {
    name: 'Magnus Carlsen',
    username: 'magnuscarlsen',
    email: 'magnus@chessflow.io',
    rating: 2882,
    gamesPlayed: 164,
    wins: 138,
    losses: 12,
    draws: 14,
  },
  {
    name: 'Hikaru Nakamura',
    username: 'hikaru',
    email: 'hikaru@chessflow.io',
    rating: 2875,
    gamesPlayed: 152,
    wins: 124,
    losses: 14,
    draws: 14,
  },
  {
    name: 'Divyanshu Sharma',
    username: 'ds2092693',
    email: 'ds2092693@chessflow.io',
    rating: 2810,
    gamesPlayed: 118,
    wins: 96,
    losses: 11,
    draws: 11,
  },
  {
    name: 'Alireza Firouzja',
    username: 'alireza',
    email: 'alireza@chessflow.io',
    rating: 2780,
    gamesPlayed: 98,
    wins: 72,
    losses: 16,
    draws: 10,
  },
  {
    name: 'Fabiano Caruana',
    username: 'fabiano',
    email: 'fabiano@chessflow.io',
    rating: 2775,
    gamesPlayed: 104,
    wins: 76,
    losses: 17,
    draws: 11,
  },
  {
    name: 'Gukesh D',
    username: 'gukesh',
    email: 'gukesh@chessflow.io',
    rating: 2768,
    gamesPlayed: 92,
    wins: 67,
    losses: 15,
    draws: 10,
  },
  {
    name: 'Praggnanandhaa R',
    username: 'pragg',
    email: 'pragg@chessflow.io',
    rating: 2750,
    gamesPlayed: 96,
    wins: 66,
    losses: 18,
    draws: 12,
  },
];

async function seed() {
  console.log('Seeding initial grandmaster player records into SQLite database...');

  for (const player of INITIAL_PLAYERS) {
    const user = await prisma.user.upsert({
      where: { email: player.email },
      update: {
        name: player.name,
        username: player.username,
        rating: player.rating,
      },
      create: {
        name: player.name,
        username: player.username,
        email: player.email,
        rating: player.rating,
        provider: 'GUEST',
      },
    });

    await prisma.playerRating.upsert({
      where: { userId: user.id },
      update: {
        currentRating: player.rating,
        peakRating: player.rating,
        gamesPlayed: player.gamesPlayed,
        wins: player.wins,
        losses: player.losses,
        draws: player.draws,
        winStreak: 3,
        longestWinStreak: 8,
      },
      create: {
        userId: user.id,
        currentRating: player.rating,
        peakRating: player.rating,
        gamesPlayed: player.gamesPlayed,
        wins: player.wins,
        losses: player.losses,
        draws: player.draws,
        winStreak: 3,
        longestWinStreak: 8,
      },
    });
  }

  console.log('✅ SQLite database seeded successfully!');
}

seed()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
