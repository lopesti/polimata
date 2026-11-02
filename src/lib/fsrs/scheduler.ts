import {
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card,
  type Grade,
  createEmptyCard,
} from "ts-fsrs";

export { Rating, State };

const params = generatorParameters({
  enable_fuzz: true,
  maximum_interval: 365,
});

export const scheduler = fsrs(params);

export type PolimataCardState = {
  dificuldade: number;
  estabilidade: number;
  facilidade: number;
  repeticoes: number;
  lapsos: number;
  estado: "novo" | "aprendendo" | "revisao" | "reaprendendo";
  proximaRevisao: Date | null;
  ultimaRevisao: Date | null;
};

const estadoToState: Record<PolimataCardState["estado"], State> = {
  novo: State.New,
  aprendendo: State.Learning,
  revisao: State.Review,
  reaprendendo: State.Relearning,
};

const stateToEstado: Record<State, PolimataCardState["estado"]> = {
  [State.New]: "novo",
  [State.Learning]: "aprendendo",
  [State.Review]: "revisao",
  [State.Relearning]: "reaprendendo",
};

/** Build ts-fsrs Card from our DB fields */
export function toFsrsCard(row: PolimataCardState): Card {
  const empty = createEmptyCard(row.ultimaRevisao ?? new Date());
  return {
    ...empty,
    due: row.proximaRevisao ?? new Date(),
    stability: row.estabilidade || 0,
    difficulty: row.dificuldade || 0,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: row.repeticoes || 0,
    lapses: row.lapsos || 0,
    state: estadoToState[row.estado] ?? State.New,
    last_review: row.ultimaRevisao ?? undefined,
  };
}

export type ReviewResult = PolimataCardState & {
  rating: Grade;
};

/**
 * Apply a rating (1=Again, 2=Hard, 3=Good, 4=Easy) and return updated state.
 */
export function reviewCard(
  row: PolimataCardState,
  rating: 1 | 2 | 3 | 4,
  now = new Date()
): ReviewResult {
  const card = toFsrsCard(row);
  const grade = rating as Grade;
  const recordLog = scheduler.repeat(card, now);
  const next = recordLog[grade].card;

  return {
    rating: grade,
    dificuldade: next.difficulty,
    estabilidade: next.stability,
    facilidade: row.facilidade, // kept for compatibility; FSRS uses difficulty
    repeticoes: next.reps,
    lapsos: next.lapses,
    estado: stateToEstado[next.state] ?? "aprendendo",
    proximaRevisao: next.due,
    ultimaRevisao: now,
  };
}

/** Preview intervals for the 4 buttons without committing */
export function previewIntervals(row: PolimataCardState, now = new Date()) {
  const card = toFsrsCard(row);
  const log = scheduler.repeat(card, now);
  const fmt = (d: Date) => {
    const ms = d.getTime() - now.getTime();
    const min = Math.round(ms / 60_000);
    if (min < 60) return `${Math.max(1, min)}m`;
    const h = Math.round(min / 60);
    if (h < 48) return `${h}h`;
    const days = Math.round(h / 24);
    return `${days}d`;
  };
  return {
    again: fmt(log[Rating.Again].card.due),
    hard: fmt(log[Rating.Hard].card.due),
    good: fmt(log[Rating.Good].card.due),
    easy: fmt(log[Rating.Easy].card.due),
  };
}

/** Parse cloze: text with {{c1::answer}} patterns */
export function parseCloze(frente: string): {
  display: string;
  answers: string[];
} {
  const answers: string[] = [];
  const display = frente.replace(/\{\{c\d+::([^}]+)\}\}/g, (_m, ans: string) => {
    answers.push(ans);
    return "____";
  });
  return { display, answers };
}

export function clozeAnswer(frente: string): string {
  return frente.replace(/\{\{c\d+::([^}]+)\}\}/g, "$1");
}
