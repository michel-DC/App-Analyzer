import type { Page } from "puppeteer";
import type { PerformanceMetrics, AuditIssue } from "../types/report";
import { RESPONSIVE_TEST_CONFIG } from "../config/puppeteer.config";
import { getMessage } from "./messages";

export async function getPerformanceMetrics(
  page: Page
): Promise<PerformanceMetrics> {
  await page.evaluate(() => {
    (window as any).__clsValue = 0;
    (window as any).__fidValue = 0;

    let clsScore = 0;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsScore += (entry as any).value;
          }
        }
        (window as any).__clsValue = clsScore;
      });
      observer.observe({ type: "layout-shift", buffered: true });
    } catch (e) {
      console.warn("CLS monitoring not supported");
    }

    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const firstInput = entry as PerformanceEventTiming;
          if (firstInput.processingStart && firstInput.startTime) {
            const fid = firstInput.processingStart - firstInput.startTime;
            (window as any).__fidValue = fid;
          }
        }
      });
      fidObserver.observe({ type: "first-input", buffered: true });
    } catch (e) {
      console.warn("FID monitoring not supported");
    }
  });

  await new Promise((resolve) => setTimeout(resolve, 1500));

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
      cumulativeLayoutShift: (window as any).__clsValue || 0,
      firstInputDelay: (window as any).__fidValue || 0,
    };
  });

  const responsiveResults = await testResponsiveDesign(page);

  return {
    ...metrics,
    isMobileResponsive: responsiveResults.mobile,
    isDesktopResponsive: responsiveResults.desktop,
  };
}

async function testResponsiveDesign(
  page: Page
): Promise<{ mobile: boolean; desktop: boolean }> {
  const results = { mobile: false, desktop: false };

  try {
    const originalViewport = page.viewport();

    await page.setViewport(RESPONSIVE_TEST_CONFIG.mobile.viewport);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mobileCheck = await page.evaluate(() => {
      const viewport = document.querySelector('meta[name="viewport"]');
      const bodyWidth = document.body.scrollWidth;
      const windowWidth = window.innerWidth;

      return {
        hasViewport: !!viewport,
        isResponsive: bodyWidth <= windowWidth * 1.1,
        noHorizontalScroll: bodyWidth <= windowWidth,
      };
    });

    results.mobile = mobileCheck.hasViewport && mobileCheck.isResponsive;

    await page.setViewport(RESPONSIVE_TEST_CONFIG.desktop.viewport);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const desktopCheck = await page.evaluate(() => {
      const bodyWidth = document.body.scrollWidth;
      const windowWidth = window.innerWidth;

      return {
        isResponsive: bodyWidth <= windowWidth * 1.05,
        noHorizontalScroll: bodyWidth <= windowWidth,
      };
    });

    results.desktop = desktopCheck.isResponsive;

    if (originalViewport) {
      await page.setViewport(originalViewport);
    }
  } catch (error) {
    console.warn("Erreur lors du test responsive:", error);
  }

  return results;
}

export function generatePerformanceIssues(
  metrics: PerformanceMetrics
): AuditIssue[] {
  const issues: AuditIssue[] = [];

  function createIssue(
    messageKey: string,
    type: AuditIssue["type"],
    severity: AuditIssue["severity"],
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
        codeExample: message.codeExample,
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

  if (metrics.loadTime > 3000) {
    createIssue(
      "slow_load_time",
      "Performance",
      metrics.loadTime > 5000 ? "high" : "medium",
      `Temps de chargement élevé : ${Math.round(metrics.loadTime)}ms (objectif : moins de 3000ms)`
    );
  }

  if (metrics.firstContentfulPaint > 1800) {
    createIssue(
      "slow_fcp",
      "Performance",
      metrics.firstContentfulPaint > 3000 ? "high" : "medium",
      `First Contentful Paint trop lent : ${Math.round(
        metrics.firstContentfulPaint
      )}ms (objectif : moins de 1800ms)`
    );
  }

  if (metrics.largestContentfulPaint > 2500) {
    createIssue(
      "slow_lcp",
      "Performance",
      metrics.largestContentfulPaint > 4000 ? "high" : "medium",
      `Largest Contentful Paint trop lent : ${Math.round(
        metrics.largestContentfulPaint
      )}ms (objectif : moins de 2500ms)`
    );
  }

  if (metrics.cumulativeLayoutShift > 0.1) {
    createIssue(
      "high_cls",
      "Performance",
      metrics.cumulativeLayoutShift > 0.25 ? "high" : "medium",
      `Cumulative Layout Shift élevé : ${metrics.cumulativeLayoutShift.toFixed(
        3
      )} (objectif : moins de 0.1)`
    );
  }

  if (metrics.firstInputDelay > 100) {
    createIssue(
      "high_fid",
      "Performance",
      metrics.firstInputDelay > 300 ? "high" : "medium",
      `First Input Delay élevé : ${Math.round(
        metrics.firstInputDelay
      )}ms (objectif : moins de 100ms)`
    );
  }

  if (!metrics.isMobileResponsive) {
    createIssue("not_mobile_responsive", "Best Practices", "high");
  }

  if (!metrics.isDesktopResponsive) {
    createIssue("desktop_responsive_issues", "Best Practices", "medium");
  }

  return issues;
}

export function calculatePerformanceScore(metrics: PerformanceMetrics): number {
  let score = 100;

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
