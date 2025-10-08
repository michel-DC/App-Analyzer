/**
 * Orchestrateur principal d'audit web
 * Coordonne tous les modules d'analyse et génère le rapport final
 */

import type { Page } from "puppeteer";
import { createBrowser } from "../config/puppeteer.config";
import {
  withTimeout,
  calculateOverallScore,
  generateShortSummary,
  generateRecommendations,
  handleError,
} from "./utils";
import {
  analyzeHTMLStructure,
  generateHTMLIssues,
  calculateSEOScore,
} from "./checkHTMLStructure";
import {
  getPerformanceMetrics,
  generatePerformanceIssues,
  calculatePerformanceScore,
} from "./getPerformanceMetrics";
import { runLighthouse, generateLighthouseIssues } from "./runLighthouse";
import { extractPageInfo } from "./extractPageInfo";
import type { AuditReport, AuditOptions, AuditIssue } from "../types/report";

/**
 * Analyse complète d'un site web
 * @param url URL du site à analyser
 * @param options Options d'audit
 * @returns Promise<AuditReport> Rapport d'audit complet
 */
export async function analyzeSite(
  url: string,
  options: AuditOptions
): Promise<AuditReport> {
  let browser;
  let page: Page | null = null;

  try {
    // Lancement du navigateur avec timeout
    browser = await withTimeout(
      createBrowser(),
      30000,
      "Timeout: impossible de lancer le navigateur"
    );
    page = await browser.newPage();

    // Configuration de la page
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    // Navigation vers l'URL avec timeout
    await withTimeout(
      page.goto(url, { waitUntil: "networkidle0", timeout: 30000 }),
      30000,
      "Timeout: site inaccessible"
    );

    // Extraction des informations de base de la page
    const pageInfo = await extractPageInfo(page);

    // Analyse HTML
    const htmlAnalysis = await analyzeHTMLStructure(page);
    const htmlIssues = generateHTMLIssues(htmlAnalysis);
    const seoScore = calculateSEOScore(htmlAnalysis);

    // Métriques de performance
    const performanceMetrics = await getPerformanceMetrics(page);
    const performanceIssues = generatePerformanceIssues(performanceMetrics);
    const performanceScore = calculatePerformanceScore(performanceMetrics);

    // Scores par défaut
    let categories = {
      seo: seoScore,
      performance: performanceScore,
      accessibility: 75, // Score par défaut
      bestPractices: 75, // Score par défaut
    };

    let allIssues: AuditIssue[] = [...htmlIssues, ...performanceIssues];

    // Exécution de Lighthouse si demandé
    if (options.lighthouse) {
      try {
        const lighthouseResult = await runLighthouse(page, url);
        const lighthouseIssues = generateLighthouseIssues(lighthouseResult);

        // Mise à jour des scores avec Lighthouse
        categories = {
          seo: Math.max(seoScore, lighthouseResult.seo),
          performance: Math.max(performanceScore, lighthouseResult.performance),
          accessibility: lighthouseResult.accessibility,
          bestPractices: lighthouseResult.bestPractices,
        };

        // Ajout des issues Lighthouse
        allIssues = [
          ...htmlIssues,
          ...performanceIssues,
          ...lighthouseIssues.map((issue) => ({
            type: issue.type as AuditIssue["type"],
            message: issue.message,
            severity: issue.severity as AuditIssue["severity"],
          })),
        ];
      } catch (lighthouseError) {
        console.warn(
          "Erreur Lighthouse, utilisation des scores par défaut:",
          lighthouseError
        );
      }
    }

    // Calcul du score global
    const overallScore = calculateOverallScore(categories);

    // Génération du rapport final
    const report: AuditReport = {
      status: "success",
      url,
      score: overallScore,
      categories,
      issues: allIssues,
      shortSummary: generateShortSummary(allIssues, overallScore),
      recommendations: generateRecommendations(allIssues),
      pageInfo,
      rowId: options.rowId,
    };

    return report;
  } catch (error) {
    console.error("Erreur lors de l'analyse:", error);

    return {
      status: "error",
      url,
      score: 0,
      categories: {
        seo: 0,
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
      },
      issues: [],
      shortSummary: "",
      recommendations: [],
      message: handleError(error),
      rowId: options.rowId,
    };
  } finally {
    // Nettoyage des ressources
    if (page) {
      try {
        await page.close();
      } catch (error) {
        console.warn("Erreur lors de la fermeture de la page:", error);
      }
    }

    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        console.warn("Erreur lors de la fermeture du navigateur:", error);
      }
    }
  }
}
