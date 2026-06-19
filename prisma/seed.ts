import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "../src/generated/prisma/client";
import { SessionType } from "../src/generated/prisma/enums";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  }),
});

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  console.log("Seeding database…");

  await prisma.sessionLog.deleteMany();
  await prisma.weeklySession.deleteMany();
  await prisma.shotsGained.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: "alex@example.com",
      name: "Alex",
      handicap: 12.4,
    },
  });

  const completedPutting = await prisma.weeklySession.create({
    data: {
      userId: user.id,
      type: SessionType.golf,
      date: daysAgo(2),
      plannedDuration: 45,
      completed: true,
      title: "Putting mechanics",
      focus: "Start line from 6ft",
    },
  });

  const completedWorkout = await prisma.weeklySession.create({
    data: {
      userId: user.id,
      type: SessionType.workout,
      date: daysAgo(1),
      plannedDuration: 60,
      completed: true,
      title: "Lower-body strength",
      focus: "Posterior chain + rotation",
    },
  });

  await prisma.weeklySession.create({
    data: {
      userId: user.id,
      type: SessionType.golf,
      date: daysFromNow(1),
      plannedDuration: 60,
      completed: false,
      title: "Range block — driver",
      focus: "Tempo & face control",
    },
  });

  await prisma.weeklySession.create({
    data: {
      userId: user.id,
      type: SessionType.recovery,
      date: daysFromNow(2),
      plannedDuration: 30,
      completed: false,
      title: "Mobility + foam roll",
      focus: "Hips and T-spine",
    },
  });

  await prisma.weeklySession.create({
    data: {
      userId: user.id,
      type: SessionType.golf,
      date: daysFromNow(4),
      plannedDuration: 120,
      completed: false,
      title: "9 holes — shot tracking",
      focus: "Course management",
    },
  });

  await prisma.sessionLog.create({
    data: {
      sessionId: completedPutting.id,
      notes: "Speed control was better today. Missed short right a few times.",
      actualDuration: 40,
      rating: 4,
      golfDrills: JSON.stringify([
        { name: "Gate drill", reps: 30, notes: "Tees ~1 ball-width apart" },
        { name: "Ladder 3-9ft", reps: 24 },
        { name: "Clock drill", reps: 20, notes: "Made 15/20 on 5ft clock" },
      ]),
      shotsLogged: JSON.stringify([
        { club: "putter", target: "6ft straight", result: "made" },
        { club: "putter", target: "6ft straight", result: "missed-low" },
        { club: "putter", target: "10ft R-to-L", result: "made" },
      ]),
    },
  });

  await prisma.sessionLog.create({
    data: {
      sessionId: completedWorkout.id,
      notes: "Felt strong. Bumped trap-bar deadlift by 5lbs.",
      actualDuration: 65,
      rating: 5,
      exercises: JSON.stringify([
        { name: "Trap-bar deadlift", sets: 4, reps: 5, weight: 245 },
        { name: "Bulgarian split squat", sets: 3, reps: 8, weight: 40 },
        { name: "Cable rotational chop", sets: 3, reps: 10, weight: 35 },
        { name: "Pallof press", sets: 3, reps: 12, weight: 25 },
      ]),
    },
  });

  await prisma.shotsGained.createMany({
    data: [
      {
        userId: user.id,
        date: daysAgo(21),
        course: "Pebble Municipal",
        sgOffTee: -0.4,
        sgApproach: -1.2,
        sgAroundGreen: 0.3,
        sgPutting: -0.8,
        total: -2.1,
      },
      {
        userId: user.id,
        date: daysAgo(12),
        course: "Harding Park",
        sgOffTee: 0.2,
        sgApproach: -0.5,
        sgAroundGreen: 0.6,
        sgPutting: -0.3,
        total: 0.0,
      },
      {
        userId: user.id,
        date: daysAgo(5),
        course: "Presidio GC",
        sgOffTee: 0.5,
        sgApproach: 0.1,
        sgAroundGreen: 0.4,
        sgPutting: 0.7,
        total: 1.7,
      },
    ],
  });

  const counts = {
    users: await prisma.user.count(),
    weeklySessions: await prisma.weeklySession.count(),
    sessionLogs: await prisma.sessionLog.count(),
    rounds: await prisma.shotsGained.count(),
  };

  console.log("Seed complete.", counts);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
