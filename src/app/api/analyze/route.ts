/**
 * Route API corrigée pour l'audit web
 * Version qui évite les conflits de casse Next.js
 */

console.log("📦 [MODULE] Chargement du module route.ts");

import { NextRequest, NextResponse } from "next/server";
console.log("📦 [MODULE] NextRequest et NextResponse importés");

import { z } from "zod";
console.log("📦 [MODULE] Zod importé");

import { analyzeSite } from "../../../lib/analyzeSite";
console.log("📦 [MODULE] analyzeSite importé");

import type { AuditReport } from "../../../types/report";
console.log("📦 [MODULE] AuditReport type importé");

// Schéma de validation Zod pour la requête
console.log("📦 [MODULE] Création du schéma Zod...");
const AnalyzeRequestSchema = z.object({
  url: z.string().min(1, "URL requise"),
  options: z
    .object({
      lighthouse: z.boolean().default(true),
    })
    .partial()
    .default({ lighthouse: true }),
});
console.log("📦 [MODULE] Schéma Zod créé:", AnalyzeRequestSchema);

// Suppression de l'audit mocké — on utilise désormais analyzeSite

/**
 * Gestionnaire POST pour l'audit web avec logs détaillés
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("🚀 [API] ===== DÉBUT DE LA FONCTION POST =====");
  console.log("🚀 [API] Fonction POST appelée");
  console.log("🚀 [API] Type de request:", typeof request);
  console.log("🚀 [API] Request object:", request);
  console.log("🚀 [API] URL de la requête:", request.url);
  console.log("🚀 [API] Méthode de la requête:", request.method);
  console.log(
    "🚀 [API] Headers de la requête:",
    Object.fromEntries(request.headers.entries())
  );

  try {
    console.log("📥 [API] Parsing du body de la requête...");
    const body = await request.json();
    console.log("📥 [API] Body reçu:", JSON.stringify(body, null, 2));

    console.log("✅ [API] Validation avec Zod...");
    const validatedData = AnalyzeRequestSchema.parse(body);
    console.log(
      "✅ [API] Données validées:",
      JSON.stringify(validatedData, null, 2)
    );

    const { url, options } = validatedData;
    console.log("🔗 [API] URL extraite:", url);
    console.log("⚙️ [API] Options extraites:", options);

    // Normalisation de l'URL
    console.log("🔧 [API] Normalisation de l'URL...");
    let normalizedUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      normalizedUrl = `https://${url}`;
      console.log("🔧 [API] URL normalisée:", normalizedUrl);
    } else {
      console.log("🔧 [API] URL déjà normalisée:", normalizedUrl);
    }

    // Validation de l'URL
    console.log("🔍 [API] Validation de l'URL...");
    try {
      new URL(normalizedUrl);
      console.log("✅ [API] URL valide:", normalizedUrl);
    } catch (urlError) {
      console.log("❌ [API] URL invalide:", urlError);
      return NextResponse.json(
        {
          status: "error",
          message: "URL invalide fournie",
        },
        { status: 400 }
      );
    }

    // Lancement de l'analyse réelle (Puppeteer/Lighthouse)
    console.log("🔬 [API] Lancement de l'analyse réelle avec analyzeSite...");
    console.log("🔬 [API] Options passées à analyzeSite:", {
      lighthouse: options?.lighthouse ?? true,
    });

    const report: AuditReport = await analyzeSite(normalizedUrl, {
      lighthouse: options?.lighthouse ?? true,
    });

    console.log(
      "📊 [API] Rapport généré par analyzeSite:",
      JSON.stringify(report, null, 2)
    );
    console.log("✅ [API] Envoi de la réponse...");

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error("💥 [API] Erreur dans l'API analyze:", error);
    console.error("💥 [API] Type d'erreur:", typeof error);
    console.error(
      "💥 [API] Stack trace:",
      error instanceof Error ? error.stack : "Pas de stack trace"
    );

    // Gestion des erreurs de validation Zod
    if (error instanceof z.ZodError) {
      console.log("❌ [API] Erreur de validation Zod:", error.issues);
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

    // Gestion des erreurs de parsing JSON
    if (error instanceof SyntaxError) {
      console.log("❌ [API] Erreur de parsing JSON:", error.message);
      return NextResponse.json(
        {
          status: "error",
          message: "JSON invalide dans le corps de la requête",
        },
        { status: 400 }
      );
    }

    // Gestion des autres erreurs
    console.log("❌ [API] Erreur interne du serveur:", error);
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

/**
 * Gestionnaire pour les méthodes non supportées
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      status: "error",
      message: "Méthode GET non supportée. Utilisez POST.",
    },
    { status: 405 }
  );
}
