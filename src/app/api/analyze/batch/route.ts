import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeSitesSequentialMap } from "../../../../lib/analyzeSitesSequential";
import type { BatchAnalyzeResponseMap } from "../../../../types/report";

const SiteSchema = z.object({
  url: z.string().min(1),
  options: z.object({
    lighthouse: z.boolean().default(true),
    rowId: z.string().optional(),
    company_email: z.string().optional(),
  }).partial().default({ lighthouse: true }).optional()
});

const BatchSchema = z.object({
  sites: z.array(SiteSchema),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = BatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ status: "error", message: "Entrée invalide" }, { status: 400 });
  }
  const { sites } = parsed.data;
  const reports = await analyzeSitesSequentialMap(sites);
  const response: BatchAnalyzeResponseMap = { reports };
  return NextResponse.json(response, { status: 200 });
}
