import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter, log: ['error', 'warn'] });

async function main() {
  console.log('🌱 Starting database seeding for NamasteBitches...');

  // Clean existing data for clean re-seeds
  await prisma.activityLog.deleteMany();
  await prisma.presence.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.report.deleteMany();
  await prisma.blockedUser.deleteMany();
  await prisma.message.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.room.deleteMany();

  // 1. Create Sample Rooms with standard Geohashes
  // We use geohashes around a simulated default center (e.g., '9q8yy' or 'dp3wq' for downtown center)
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        name: 'Neon Cyber Lounge',
        slug: 'neon-cyber-lounge',
        description: 'The premier local frequency for late night coders, hackers, and synthwave enthusiasts.',
        geohash: 'dp3wq',
        radius: 2000,
        radiusMeters: 2000,
        type: 'Event Venue',
        category: 'nightlife',
        latitude: 37.7750,
        longitude: -122.4180,
        activityScore: 95,
        isOfficial: true,
      },
    }),
    prisma.room.create({
      data: {
        name: 'Central Coffee Shop',
        slug: 'central-coffee-shop',
        description: 'Need a study break or coffee recommendation? Broadcast locally to fellow grinders.',
        geohash: 'dp3wq',
        radius: 500,
        radiusMeters: 500,
        type: 'Coffee Shop',
        category: 'chill',
        latitude: 37.7745,
        longitude: -122.4190,
        activityScore: 82,
        isOfficial: true,
      },
    }),
    prisma.room.create({
      data: {
        name: 'University Campus Hub',
        slug: 'university-campus-hub',
        description: 'Anonymous campus square. Share notes, events, and find study groups in your building.',
        geohash: 'dp3wr',
        radius: 3000,
        radiusMeters: 3000,
        type: 'College Campus',
        category: 'campus',
        latitude: 37.7760,
        longitude: -122.4210,
        activityScore: 120,
        isOfficial: true,
      },
    }),
    prisma.room.create({
      data: {
        name: 'International Airport T1',
        slug: 'international-airport-t1',
        description: 'Stuck during a layover? Chat with travelers at gates nearby without exchanging info.',
        geohash: 'dp3wx',
        radius: 5000,
        radiusMeters: 5000,
        type: 'Airport',
        category: 'general',
        latitude: 37.7710,
        longitude: -122.4150,
        activityScore: 65,
      },
    }),
    prisma.room.create({
      data: {
        name: 'Underground Metro Station',
        slug: 'underground-metro-station',
        description: 'Quick transit frequency. Check train delays and commuter vibes.',
        geohash: 'dp3wq',
        radius: 800,
        radiusMeters: 800,
        type: 'Metro Station',
        category: 'general',
        latitude: 37.7735,
        longitude: -122.4175,
        activityScore: 40,
      },
    }),
    prisma.room.create({
      data: {
        name: 'City Tech Library',
        slug: 'city-tech-library',
        description: 'Silent study zone and open source hack space. Keep your radio frequencies quiet!',
        geohash: 'dp3wt',
        radius: 1000,
        radiusMeters: 1000,
        type: 'Library',
        category: 'tech',
        latitude: 37.7770,
        longitude: -122.4225,
        activityScore: 30,
        isOfficial: true,
      },
    }),
  ]);

  console.log(`✅ Created ${rooms.length} sample rooms.`);

  // 2. Create Sample Anonymous Users
  const sampleIdentities = [
    { username: 'Cosmic Tiger', avatar: '🐱', accentColor: '#00f2fe' },
    { username: 'Silent Fox', avatar: '🦊', accentColor: '#ff007f' },
    { username: 'Shadow Wolf', avatar: '🐺', accentColor: '#8a2be2' },
    { username: 'Crimson Eagle', avatar: '🦅', accentColor: '#00ff87' },
    { username: 'Blue Panda', avatar: '🐼', accentColor: '#ffcf00' },
    { username: 'Neon Viper', avatar: '🐍', accentColor: '#00f2fe' },
  ];

  const users = await Promise.all(
    sampleIdentities.map((id) =>
      prisma.user.create({
        data: {
          username: id.username,
          avatar: id.avatar,
          accentColor: id.accentColor,
        },
      })
    )
  );

  console.log(`✅ Created ${users.length} sample anonymous users.`);

  // 3. Create Sample Messages in "Neon Cyber Lounge" and "Central Coffee Shop"
  const lounge = rooms[0];
  const coffeeShop = rooms[1];

  await prisma.message.createMany({
    data: [
      {
        roomId: lounge.id,
        userId: users[0].id,
        content: 'Welcome to NamasteBitches! Anyone around this geohash sector tonight? 🚀',
      },
      {
        roomId: lounge.id,
        userId: users[1].id,
        content: 'Hey Cosmic Tiger! Silent Fox here. The glassmorphism UI in this room is insanely clean! ✨',
      },
      {
        roomId: lounge.id,
        userId: users[2].id,
        content: 'Just dropped in from the Campus Hub room. Real-time speed is zero lag 🔥',
      },
      {
        roomId: coffeeShop.id,
        userId: users[3].id,
        content: 'Anyone grabbing latte near the station? Let me know!',
      },
      {
        roomId: coffeeShop.id,
        userId: users[4].id,
        content: 'On my way down! Stay anonymous 👀',
      },
    ],
  });

  console.log('✅ Created sample messages.');

  // 4. Create Sample Presences
  await Promise.all(
    users.slice(0, 3).map((u) =>
      prisma.presence.create({
        data: {
          userId: u.id,
          roomId: lounge.id,
          isTyping: u.username === 'Silent Fox',
        },
      })
    )
  );

  console.log('✅ Database seeding finished successfully! 🎉');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
