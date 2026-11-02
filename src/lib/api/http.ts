import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: number | ResponseInit) {
  const status = typeof init === "number" ? init : init?.status ?? 200;
  const rest = typeof init === "number" ? {} : init ?? {};
  return NextResponse.json({ data, error: null }, { ...rest, status });
}

export function fail(
  message: string,
  status = 400,
  details?: unknown
) {
  return NextResponse.json(
    { data: null, error: message, details: details ?? null },
    { status }
  );
}

export async function parseJson<T>(req: Request): Promise<T> {
  return (await req.json()) as T;
}
