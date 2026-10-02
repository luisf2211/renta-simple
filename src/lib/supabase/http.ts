import "server-only";
import { NextResponse } from "next/server";

export function ok<T>(data: T) {
  return NextResponse.json({ data });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function handle<T>(fn: () => Promise<T>) {
  try {
    const data = await fn();
    return ok(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    // eslint-disable-next-line no-console
    console.error("[api]", message);
    return fail(message, 500);
  }
}
