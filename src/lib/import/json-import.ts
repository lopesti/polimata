import { db } from "@/lib/db/client";
import {
  fontes,
  notas,
  blocos,
  metodos,
  stacks,
  perguntas,
  sessoes,
} from "@/lib/db/schema";

export type ExportPayload = {
  version?: number;
  fontes?: unknown[];
  notas?: unknown[];
  blocos?: unknown[];
  metodos?: unknown[];
  stacks?: unknown[];
  perguntas?: unknown[];
  sessoes?: unknown[];
};

export function importJsonBackup(payload: ExportPayload): {
  inserted: Record<string, number>;
  errors: string[];
} {
  const inserted: Record<string, number> = {
    fontes: 0,
    notas: 0,
    blocos: 0,
    metodos: 0,
    stacks: 0,
    perguntas: 0,
    sessoes: 0,
  };
  const errors: string[] = [];

  const run = (key: keyof typeof inserted, fn: () => void) => {
    try {
      fn();
      inserted[key]++;
    } catch (e) {
      errors.push(`${key}: ${String(e)}`);
    }
  };

  for (const row of (payload.metodos as any[]) ?? []) {
    run("metodos", () => db.insert(metodos).values(row).run());
  }
  for (const row of (payload.fontes as any[]) ?? []) {
    run("fontes", () => db.insert(fontes).values(row).run());
  }
  for (const row of (payload.notas as any[]) ?? []) {
    run("notas", () => db.insert(notas).values(row).run());
  }
  for (const row of (payload.blocos as any[]) ?? []) {
    run("blocos", () => db.insert(blocos).values(row).run());
  }
  for (const row of (payload.stacks as any[]) ?? []) {
    run("stacks", () => db.insert(stacks).values(row).run());
  }
  for (const row of (payload.perguntas as any[]) ?? []) {
    run("perguntas", () => db.insert(perguntas).values(row).run());
  }
  for (const row of (payload.sessoes as any[]) ?? []) {
    run("sessoes", () => db.insert(sessoes).values(row).run());
  }

  return { inserted, errors };
}
