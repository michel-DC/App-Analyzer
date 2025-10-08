/**
 * Wrapper pour Lighthouse - Isolation des dépendances Node.js
 * Ce module charge dynamiquement Lighthouse uniquement côté serveur
 * et évite les problèmes de bundling avec Next.js
 */

import type { Page } from "puppeteer";
import type { LighthouseResult } from "../types/report";

/**
 * Interface pour le résultat Lighthouse
 */
interface LighthouseRunnerResult {
  lhr: {
    categories: {
      performance?: { score: number | null };
      seo?: { score: number | null };
      accessibility?: { score: number | null };
      "best-practices"?: { score: number | null };
    };
  };
}

/**
 * Vérifie si nous sommes côté serveur
 */
function isServer(): boolean {
  return typeof window === "undefined";
}

/**
 * Exécute Lighthouse avec chargement dynamique et gestion d'erreurs robuste
 * @param page Instance Puppeteer de la page
 * @param url URL de la page à analyser
 * @returns Promise<LighthouseResult> Scores Lighthouse
 */
export async function runLighthouseSafe(
  page: Page,
  url: string
): Promise<LighthouseResult> {
  // Vérification côté serveur uniquement
  if (!isServer()) {
    console.warn("Lighthouse ne peut pas s'exécuter côté client");
    return {
      performance: 0,
      seo: 0,
      accessibility: 0,
      bestPractices: 0,
    };
  }

  try {
    // Chargement dynamique de Lighthouse avec gestion d'erreurs
    const lighthouseModule = await import("lighthouse");
    const lighthouse = lighthouseModule.default;

    if (!lighthouse) {
      throw new Error("Lighthouse n'a pas pu être chargé");
    }

    // Configuration Lighthouse optimisée
    const options = {
      logLevel: "error" as const,
      output: "json" as const,
      onlyCategories: ["performance", "seo", "accessibility", "best-practices"],
      port: parseInt(new URL(page.url()).port || "9222"),
      // Configuration pour éviter les problèmes de réseau
      disableStorageReset: true,
      disableDeviceEmulation: true,
    };

    // Exécution de Lighthouse avec timeout
    const runnerResult = (await lighthouse(
      url,
      options
    )) as LighthouseRunnerResult;

    if (!runnerResult || !runnerResult.lhr) {
      throw new Error("Lighthouse n'a pas pu générer de rapport valide");
    }

    const lhr = runnerResult.lhr;

    // Extraction sécurisée des scores avec valeurs par défaut
    const result: LighthouseResult = {
      performance: Math.round((lhr.categories.performance?.score || 0) * 100),
      seo: Math.round((lhr.categories.seo?.score || 0) * 100),
      accessibility: Math.round(
        (lhr.categories.accessibility?.score || 0) * 100
      ),
      bestPractices: Math.round(
        (lhr.categories["best-practices"]?.score || 0) * 100
      ),
    };

    return result;
  } catch (error) {
    console.warn("Erreur lors de l'exécution de Lighthouse:", error);

    // Retour de scores par défaut en cas d'erreur
    return {
      performance: 0,
      seo: 0,
      accessibility: 0,
      bestPractices: 0,
    };
  }
}

/**
 * Génère des issues basées sur les scores Lighthouse
 * @param lighthouseResult Scores Lighthouse
 * @returns Array<{type: string, message: string, severity: string}> Issues générées
 */
export function generateLighthouseIssues(
  lighthouseResult: LighthouseResult
): Array<{
  type: string;
  message: string;
  severity: string;
}> {
  const issues: Array<{ type: string; message: string; severity: string }> = [];

  // Issues de performance
  if (lighthouseResult.performance < 50) {
    issues.push({
      type: "Performance",
      message: `Score de performance très faible: ${lighthouseResult.performance}/100`,
      severity: "high",
    });
  } else if (lighthouseResult.performance < 75) {
    issues.push({
      type: "Performance",
      message: `Score de performance faible: ${lighthouseResult.performance}/100`,
      severity: "medium",
    });
  }

  // Issues SEO
  if (lighthouseResult.seo < 50) {
    issues.push({
      type: "SEO",
      message: `Score SEO très faible: ${lighthouseResult.seo}/100`,
      severity: "high",
    });
  } else if (lighthouseResult.seo < 75) {
    issues.push({
      type: "SEO",
      message: `Score SEO faible: ${lighthouseResult.seo}/100`,
      severity: "medium",
    });
  }

  // Issues d'accessibilité
  if (lighthouseResult.accessibility < 50) {
    issues.push({
      type: "Accessibility",
      message: `Score d'accessibilité très faible: ${lighthouseResult.accessibility}/100`,
      severity: "high",
    });
  } else if (lighthouseResult.accessibility < 75) {
    issues.push({
      type: "Accessibility",
      message: `Score d'accessibilité faible: ${lighthouseResult.accessibility}/100`,
      severity: "medium",
    });
  }

  // Issues de bonnes pratiques
  if (lighthouseResult.bestPractices < 50) {
    issues.push({
      type: "Best Practices",
      message: `Score de bonnes pratiques très faible: ${lighthouseResult.bestPractices}/100`,
      severity: "high",
    });
  } else if (lighthouseResult.bestPractices < 75) {
    issues.push({
      type: "Best Practices",
      message: `Score de bonnes pratiques faible: ${lighthouseResult.bestPractices}/100`,
      severity: "medium",
    });
  }

  return issues;
}
