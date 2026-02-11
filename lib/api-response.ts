import { NextResponse } from "next/server";

export function json(body: { data?: any; error?: string | null }, status = 200) {
  return NextResponse.json(body, { status });
}

export function success(data: any, status = 200) {
  return json({ data, error: null }, status);
}

export function error(message: string, status = 400) {
  return json({ data: null, error: message }, status);
}
