/**
 * Récupérateur de métriques de performance
 * Mesure les performances de chargement et teste le responsive design
 */

import type { Page } from "puppeteer";
import type { PerformanceMetrics, AuditIssue } from "../types/report";
import { RESPONSIVE_TEST_CONFIG } from "../config/puppeteer.config";

/**
 * Récupère les métriques de performance d'une page
 * @param page Instance Puppeteer de la page
 * @returns Promise<PerformanceMetrics> Métriques de performance
 */
export async function getPerformanceMetrics(
  page: Page
): Promise<PerformanceMetrics> {
  // Récupération des métriques de performance via l'API Performance
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType("paint");

    const fcp = paint.find((entry) => entry.name === "first-contentful-paint");
    const lcp = performance.getEntriesByType("largest-contentful-paint");

    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded:
        navigation.domContentLoadedEventEnd -
        navigation.domContentLoadedEventStart,
      firstContentfulPaint: fcp ? fcp.startTime : 0,
      largestContentfulPaint:
        lcp.length > 0 ? lcp[lcp.length - 1].startTime : 0,
      cumulativeLayoutShift: 0, // Sera calculé via Lighthouse
      firstInputDelay: 0, // Sera calculé via Lighthouse
    };
  });

  // Test du responsive design
  const responsiveResults = await testResponsiveDesign(page);

  return {
    ...metrics,
    isMobileResponsive: responsiveResults.mobile,
    isDesktopResponsive: responsiveResults.desktop,
  };
}

/**
 * Teste le responsive design sur mobile et desktop
 * @param page Instance Puppeteer de la page
 * @returns Promise<{mobile: boolean, desktop: boolean}> Résultats des tests
 */
async function testResponsiveDesign(
  page: Page
): Promise<{ mobile: boolean; desktop: boolean }> {
  const results = { mobile: false, desktop: false };

  try {
    // Test mobile
    await page.setViewport(RESPONSIVE_TEST_CONFIG.mobile.viewport);
    await page.setUserAgent(RESPONSIVE_TEST_CONFIG.mobile.userAgent);
    await page.reload({ waitUntil: "networkidle0" });

    const mobileCheck = await page.evaluate(() => {
      const viewport = document.querySelector('meta[name="viewport"]');
      const bodyWidth = document.body.scrollWidth;
      const windowWidth = window.innerWidth;

      // Vérifie si la page s'adapte correctement au mobile
      return {
        hasViewport: !!viewport,
        isResponsive: bodyWidth <= windowWidth * 1.1, // 10% de tolérance
        noHorizontalScroll: bodyWidth <= windowWidth,
      };
    });

    results.mobile = mobileCheck.hasViewport && mobileCheck.isResponsive;

    // Test desktop
    await page.setViewport(RESPONSIVE_TEST_CONFIG.desktop.viewport);
    await page.setUserAgent(RESPONSIVE_TEST_CONFIG.desktop.userAgent);
    await page.reload({ waitUntil: "networkidle0" });

    const desktopCheck = await page.evaluate(() => {
      const bodyWidth = document.body.scrollWidth;
      const windowWidth = window.innerWidth;

      return {
        isResponsive: bodyWidth <= windowWidth * 1.05, // 5% de tolérance pour desktop
        noHorizontalScroll: bodyWidth <= windowWidth,
      };
    });

    results.desktop = desktopCheck.isResponsive;
  } catch (error) {
    console.warn("Erreur lors du test responsive:", error);
  }

  return results;
}

/**
 * Génère les issues basées sur les métriques de performance
 * @param metrics Métriques de performance
 * @returns AuditIssue[] Liste des issues détectées
 */
export function generatePerformanceIssues(
  metrics: PerformanceMetrics
): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // Vérification du temps de chargement
  if (metrics.loadTime > 3000) {
    issues.push({
      type: "Performance",
      message: `Temps de chargement élevé: ${Math.round(metrics.loadTime)}ms`,
      severity: metrics.loadTime > 5000 ? "high" : "medium",
    });
  }

  // Vérification du First Contentful Paint
  if (metrics.firstContentfulPaint > 2000) {
    issues.push({
      type: "Performance",
      message: `First Contentful Paint élevé: ${Math.round(
        metrics.firstContentfulPaint
      )}ms`,
      severity: metrics.firstContentfulPaint > 3000 ? "high" : "medium",
    });
  }

  // Vérification du Largest Contentful Paint
  if (metrics.largestContentfulPaint > 2500) {
    issues.push({
      type: "Performance",
      message: `Largest Contentful Paint élevé: ${Math.round(
        metrics.largestContentfulPaint
      )}ms`,
      severity: metrics.largestContentfulPaint > 4000 ? "high" : "medium",
    });
  }

  // Vérification du responsive design
  if (!metrics.isMobileResponsive) {
    issues.push({
      type: "Best Practices",
      message: "Site non optimisé pour mobile",
      severity: "high",
    });
  }

  if (!metrics.isDesktopResponsive) {
    issues.push({
      type: "Best Practices",
      message: "Problèmes d'affichage sur desktop",
      severity: "medium",
    });
  }

  return issues;
}

/**
 * Calcule un score de performance basé sur les métriques
 * @param metrics Métriques de performance
 * @returns number Score de performance (0-100)
 */
export function calculatePerformanceScore(metrics: PerformanceMetrics): number {
  let score = 100;

  // Pénalités basées sur les métriques
  if (metrics.loadTime > 5000) score -= 30;
  else if (metrics.loadTime > 3000) score -= 20;
  else if (metrics.loadTime > 2000) score -= 10;

  if (metrics.firstContentfulPaint > 3000) score -= 25;
  else if (metrics.firstContentfulPaint > 2000) score -= 15;
  else if (metrics.firstContentfulPaint > 1500) score -= 5;

  if (metrics.largestContentfulPaint > 4000) score -= 25;
  else if (metrics.largestContentfulPaint > 2500) score -= 15;
  else if (metrics.largestContentfulPaint > 2000) score -= 5;

  if (!metrics.isMobileResponsive) score -= 20;
  if (!metrics.isDesktopResponsive) score -= 10;

  return Math.max(0, score);
}
