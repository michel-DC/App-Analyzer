import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeSite } from "../../../lib/analyzeSite";
import type { AuditReport } from "../../../types/report";
const AnalyzeRequestSchema = z.object({
  url: z.string().min(1, "URL requise"),
  options: z
    .object({
      lighthouse: z.boolean().default(true),
      rowId: z.string().optional(),
      company_email: z.string().optional(),
    })
    .partial()
    .default({ lighthouse: true }),
});

export async function POST(request: NextRequest): Promise<NextResponse> {

  try {
    const body = await request.json();
    const validatedData = AnalyzeRequestSchema.parse(body);

    const { url, options } = validatedData;
    let normalizedUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      normalizedUrl = `https://${url}`;
    }

    try {
      new URL(normalizedUrl);
    } catch (urlError) {
      return NextResponse.json(
        {
          status: "error",
          message: "URL invalide fournie",
        },
        { status: 400 }
      );
    }

    const report: AuditReport = await analyzeSite(normalizedUrl, {
      lighthouse: options?.lighthouse ?? true,
      rowId: options?.rowId,
      company_email: options?.company_email,
    });

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          status: "error",
          message: `Données invalides: ${error.issues
            .map((e: { message: string }) => e.message)
            .join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          status: "error",
          message: "JSON invalide dans le corps de la requête",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        message: "Erreur interne du serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
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
