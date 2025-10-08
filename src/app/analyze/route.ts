/**
 * Route alternative /analyze
 * Redirige vers /api/analyze pour maintenir la compatibilité
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Redirection vers l'API principale
  const url = new URL("/api/analyze", request.url);

  // Recréation de la requête avec les mêmes données
  const body = await request.text();
  const headers = new Headers(request.headers);

  const newRequest = new Request(url, {
    method: "POST",
    headers,
    body,
  });

  // Appel de l'API principale
  const response = await fetch(newRequest);
  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      status: "error",
      message: "Méthode GET non supportée. Utilisez POST.",
    },
    { status: 405 }
  );
}
