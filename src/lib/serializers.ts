import type {
  ExerciseSet,
  Goal,
  GoalCategory,
  GoalStatus,
  PlannerSession,
  SessionLog,
  SessionType,
} from "@/types";

interface RawLog {
  id: string;
  sessionId: string;
  notes: string | null;
  actualDuration: number | null;
  rating: number | null;
  practiced: string | null;
  ballsHit: number | null;
  course: string | null;
  score: number | null;
  shotsGainedId: string | null;
  exercises: string | null;
}

interface RawSession {
  id: string;
  userId: string;
  type: string;
  date: Date;
  plannedDuration: number;
  completed: boolean;
  title: string | null;
  focus: string | null;
  log?: RawLog | null;
}

function parseExercises(raw: string | null): ExerciseSet[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed
      .filter(
        (item): item is ExerciseSet =>
          item != null &&
          typeof item === "object" &&
          typeof item.name === "string" &&
          typeof item.sets === "number" &&
          typeof item.reps === "number",
      )
      .map((item) => ({
        name: item.name,
        sets: item.sets,
        reps: item.reps,
        weight: typeof item.weight === "number" ? item.weight : null,
      }));
  } catch {
    return null;
  }
}

export function serializeLog(log: RawLog): SessionLog {
  return {
    id: log.id,
    sessionId: log.sessionId,
    notes: log.notes,
    actualDuration: log.actualDuration,
    rating: log.rating,
    practiced: log.practiced,
    ballsHit: log.ballsHit,
    course: log.course,
    score: log.score,
    shotsGainedId: log.shotsGainedId,
    exercises: parseExercises(log.exercises),
  };
}

export function serializeSession(session: RawSession): PlannerSession {
  return {
    id: session.id,
    userId: session.userId,
    type: session.type as SessionType,
    date: session.date.toISOString(),
    plannedDuration: session.plannedDuration,
    completed: session.completed,
    title: session.title,
    focus: session.focus,
    log: session.log ? serializeLog(session.log) : null,
  };
}

interface RawGoal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: string;
  targetDate: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export function serializeGoal(goal: RawGoal): Goal {
  return {
    id: goal.id,
    userId: goal.userId,
    title: goal.title,
    description: goal.description,
    category: goal.category as GoalCategory,
    targetDate: goal.targetDate,
    status: goal.status as GoalStatus,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  };
}
