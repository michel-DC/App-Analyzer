import type { Page } from "puppeteer";
import type { LighthouseResult } from "../types/report";
import { getMessage } from "./messages";

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

function isServer(): boolean {
  return typeof window === "undefined";
}

export async function runLighthouseSafe(
  page: Page,
  url: string
): Promise<LighthouseResult> {
  if (!isServer()) {
    console.warn("Lighthouse ne peut pas s'exécuter côté client");
    return {
      performance: -1,
      seo: -1,
      accessibility: -1,
      bestPractices: -1,
    };
  }

  try {
    const lighthouseModule = await import("lighthouse");
    const lighthouse = lighthouseModule.default;

    if (!lighthouse) {
      throw new Error("Lighthouse n'a pas pu être chargé");
    }

    const browser = page.browser();
    const browserWSEndpoint = browser.wsEndpoint();
    const portMatch = browserWSEndpoint.match(/:(\d+)\//);
    const port = portMatch ? parseInt(portMatch[1]) : 9222;

    console.log(`Lighthouse utilise le port: ${port}`);

    const options = {
      logLevel: "error" as const,
      output: "json" as const,
      onlyCategories: ["performance", "seo", "accessibility", "best-practices"],
      port: port,
      disableStorageReset: true,
      disableDeviceEmulation: true,
    };

    const runnerResult = (await lighthouse(
      url,
      options
    )) as LighthouseRunnerResult;

    if (!runnerResult || !runnerResult.lhr) {
      throw new Error("Lighthouse n'a pas pu générer de rapport valide");
    }

    const lhr = runnerResult.lhr;

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

    return {
      performance: -1,
      seo: -1,
      accessibility: -1,
      bestPractices: -1,
    };
  }
}

export function generateLighthouseIssues(
  lighthouseResult: LighthouseResult
): Array<{
  type: string;
  message: string;
  severity: string;
  messageKey?: string;
  priority?: "critique" | "important" | "amélioration";
  description?: string;
  impact?: string;
  action?: string;
}> {
  const issues: Array<{
    type: string;
    message: string;
    severity: string;
    messageKey?: string;
    priority?: "critique" | "important" | "amélioration";
    description?: string;
    impact?: string;
    action?: string;
  }> = [];

  function createIssue(
    messageKey: string,
    type: string,
    severity: string,
    customMessage?: string
  ): void {
    const message = getMessage(messageKey);
    if (message) {
      issues.push({
        type,
        message: customMessage || message.short,
        severity,
        messageKey,
        priority: message.priority,
        description: message.description,
        impact: message.impact,
        action: message.action,
      });
    } else {
      issues.push({
        type,
        message: customMessage || "Problème détecté",
        severity,
        messageKey,
      });
    }
  }

  const allFailed =
    lighthouseResult.performance === -1 &&
    lighthouseResult.seo === -1 &&
    lighthouseResult.accessibility === -1 &&
    lighthouseResult.bestPractices === -1;

  if (allFailed) {
    return issues;
  }

  if (lighthouseResult.performance === -1) {
    return issues;
  } else if (lighthouseResult.performance < 50) {
    createIssue(
      "low_performance_score",
      "Performance",
      "high",
      `Score de performance Lighthouse très faible : ${lighthouseResult.performance}/100`
    );
  } else if (lighthouseResult.performance < 75) {
    createIssue(
      "low_performance_score",
      "Performance",
      "medium",
      `Score de performance Lighthouse à améliorer : ${lighthouseResult.performance}/100`
    );
  }

  if (lighthouseResult.seo === -1) {
    return issues;
  } else if (lighthouseResult.seo < 50) {
    createIssue(
      "low_seo_score",
      "SEO",
      "high",
      `Score SEO Lighthouse très faible : ${lighthouseResult.seo}/100`
    );
  } else if (lighthouseResult.seo < 75) {
    createIssue(
      "low_seo_score",
      "SEO",
      "medium",
      `Score SEO Lighthouse à améliorer : ${lighthouseResult.seo}/100`
    );
  }

  if (lighthouseResult.accessibility === -1) {
    return issues;
  } else if (lighthouseResult.accessibility < 50) {
    createIssue(
      "low_accessibility_score",
      "Accessibility",
      "high",
      `Score d'accessibilité Lighthouse très faible : ${lighthouseResult.accessibility}/100`
    );
  } else if (lighthouseResult.accessibility < 75) {
    createIssue(
      "low_accessibility_score",
      "Accessibility",
      "medium",
      `Score d'accessibilité Lighthouse à améliorer : ${lighthouseResult.accessibility}/100`
    );
  }

  if (lighthouseResult.bestPractices === -1) {
    return issues;
  } else if (lighthouseResult.bestPractices < 50) {
    createIssue(
      "low_best_practices_score",
      "Best Practices",
      "high",
      `Score de bonnes pratiques Lighthouse très faible : ${lighthouseResult.bestPractices}/100`
    );
  } else if (lighthouseResult.bestPractices < 75) {
    createIssue(
      "low_best_practices_score",
      "Best Practices",
      "medium",
      `Score de bonnes pratiques Lighthouse à améliorer : ${lighthouseResult.bestPractices}/100`
    );
  }

  return issues;
}
