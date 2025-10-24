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
import { detectTechnologies } from "./detectTechnologies";
import {
  generateContextualRecommendations,
  generateQuickWins,
  generateSiteTypeSpecificAdvice,
} from "./contextualRecommendations";
import type { AuditReport, AuditOptions, AuditIssue } from "../types/report";

export async function analyzeSite(
  url: string,
  options: AuditOptions
): Promise<AuditReport> {
  let browser;
  let page: Page | null = null;

  try {
    browser = await withTimeout(
      createBrowser(),
      30000,
      "Timeout: impossible de lancer le navigateur"
    );
    page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    await withTimeout(
      page.goto(url, { waitUntil: "networkidle0", timeout: 30000 }),
      30000,
      "Timeout: site inaccessible"
    );

    const pageInfo = await extractPageInfo(page);

    const technologyDetection = await detectTechnologies(page);

    const htmlAnalysis = await analyzeHTMLStructure(page);
    const htmlIssues = generateHTMLIssues(htmlAnalysis);
    const seoScore = calculateSEOScore(htmlAnalysis);

    const performanceMetrics = await getPerformanceMetrics(page);
    const performanceIssues = generatePerformanceIssues(performanceMetrics);
    const performanceScore = calculatePerformanceScore(performanceMetrics);

    let categories = {
      seo: seoScore,
      performance: performanceScore,
      accessibility: -1,
      bestPractices: -1,
    };

    let allIssues: AuditIssue[] = [...htmlIssues, ...performanceIssues];

    if (options.lighthouse) {
      try {
        const lighthouseResult = await runLighthouse(page, url);
        
        if (
          lighthouseResult.performance !== -1 &&
          lighthouseResult.seo !== -1 &&
          lighthouseResult.accessibility !== -1 &&
          lighthouseResult.bestPractices !== -1
        ) {
          categories = {
            seo: Math.max(seoScore, lighthouseResult.seo),
            performance: Math.max(
              performanceScore,
              lighthouseResult.performance
            ),
            accessibility: lighthouseResult.accessibility,
            bestPractices: lighthouseResult.bestPractices,
          };
        } else {
          categories.accessibility = lighthouseResult.accessibility;
          categories.bestPractices = lighthouseResult.bestPractices;
        }

        const lighthouseIssues = generateLighthouseIssues(lighthouseResult);

        allIssues = [
          ...htmlIssues,
          ...performanceIssues,
          ...lighthouseIssues.map((issue) => ({
            type: issue.type as AuditIssue["type"],
            message: issue.message,
            severity: issue.severity as AuditIssue["severity"],
            messageKey: issue.messageKey,
            priority: issue.priority,
            description: issue.description,
            impact: issue.impact,
            action: issue.action,
          })),
        ];
      } catch (lighthouseError) {
        console.warn(
          "Erreur Lighthouse, scores non disponibles:",
          lighthouseError
        );
      }
    }

    const validCategories = {
      seo: categories.seo >= 0 ? categories.seo : 0,
      performance: categories.performance >= 0 ? categories.performance : 0,
      accessibility: categories.accessibility >= 0 ? categories.accessibility : 0,
      bestPractices: categories.bestPractices >= 0 ? categories.bestPractices : 0,
    };

    const overallScore = calculateOverallScore(validCategories);

    generateContextualRecommendations(
      allIssues,
      technologyDetection.siteType,
      technologyDetection.cms
    );

    generateQuickWins(allIssues);

    generateSiteTypeSpecificAdvice(
      technologyDetection.siteType,
      allIssues
    );

    const simplifiedIssues = allIssues.map(issue => ({
      type: issue.type,
      message: issue.message,
      severity: issue.severity
    }));

    const report: AuditReport = {
      status: "success",
      url,
      score: overallScore,
      categories,
      issues: simplifiedIssues,
      shortSummary: generateShortSummary(allIssues, overallScore),
      recommendations: generateRecommendations(allIssues),
      pageInfo,
      rowId: options.rowId,
      company_email: options.company_email,
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
      company_email: options.company_email,
    };
  } finally {
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
