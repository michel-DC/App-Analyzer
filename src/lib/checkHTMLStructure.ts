import type { Page } from "puppeteer";
import type { HTMLAnalysis, AuditIssue } from "../types/report";
import { getMessage } from "./messages";

export async function analyzeHTMLStructure(page: Page): Promise<HTMLAnalysis> {
  const analysis = await page.evaluate(() => {
    const title = document.querySelector("title");
    const titleText = title?.textContent?.trim() || "";
    const titleLength = titleText.length;

    const metaDescription = document.querySelector('meta[name="description"]');
    const metaDescriptionContent =
      metaDescription?.getAttribute("content")?.trim() || "";
    const metaDescriptionLength = metaDescriptionContent.length;

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const canonicalLink = document.querySelector('link[rel="canonical"]');

    const headings = {
      h1: document.querySelectorAll("h1").length,
      h2: document.querySelectorAll("h2").length,
      h3: document.querySelectorAll("h3").length,
      h4: document.querySelectorAll("h4").length,
      h5: document.querySelectorAll("h5").length,
      h6: document.querySelectorAll("h6").length,
    };

    const images = document.querySelectorAll("img");
    const imagesWithoutAlt = Array.from(images).filter(
      (img) => !img.alt || img.alt.trim() === ""
    ).length;

    return {
      hasTitle: titleLength > 0,
      titleLength,
      hasMetaDescription: metaDescriptionLength > 0,
      metaDescriptionLength,
      hasMetaKeywords:
        !!metaKeywords && metaKeywords.getAttribute("content")?.trim() !== "",
      headingStructure: headings,
      imagesWithoutAlt,
      totalImages: images.length,
      hasViewportMeta: !!viewportMeta,
      hasCanonicalLink: !!canonicalLink,
    };
  });

  return analysis;
}

export function generateHTMLIssues(analysis: HTMLAnalysis): AuditIssue[] {
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

  if (!analysis.hasTitle) {
    createIssue("missing_title", "SEO", "high");
  } else if (analysis.titleLength && analysis.titleLength < 30) {
    createIssue(
      "title_too_short",
      "SEO",
      "medium",
      `Titre de page trop court (${analysis.titleLength} caractères)`
    );
  } else if (analysis.titleLength && analysis.titleLength > 60) {
    createIssue(
      "title_too_long",
      "SEO",
      "medium",
      `Titre de page trop long (${analysis.titleLength} caractères)`
    );
  }

  if (!analysis.hasMetaDescription) {
    createIssue("missing_meta_description", "SEO", "high");
  } else if (
    analysis.metaDescriptionLength &&
    analysis.metaDescriptionLength < 120
  ) {
    createIssue(
      "meta_description_too_short",
      "SEO",
      "medium",
      `Meta description trop courte (${analysis.metaDescriptionLength} caractères)`
    );
  } else if (
    analysis.metaDescriptionLength &&
    analysis.metaDescriptionLength > 160
  ) {
    createIssue(
      "meta_description_too_long",
      "SEO",
      "medium",
      `Meta description trop longue (${analysis.metaDescriptionLength} caractères)`
    );
  }

  if (!analysis.hasViewportMeta) {
    createIssue("missing_viewport_meta", "Best Practices", "high");
  }

  if (!analysis.hasCanonicalLink) {
    createIssue("missing_canonical_link", "SEO", "medium");
  }

  if (analysis.headingStructure.h1 === 0) {
    createIssue("missing_h1", "HTML Structure", "high");
  } else if (analysis.headingStructure.h1 > 1) {
    createIssue(
      "multiple_h1",
      "HTML Structure",
      "medium",
      `${analysis.headingStructure.h1} titres H1 trouvés (recommandé : un seul)`
    );
  }

  if (analysis.imagesWithoutAlt > 0) {
    createIssue(
      "images_without_alt",
      "Accessibility",
      analysis.imagesWithoutAlt > 5 ? "high" : "medium",
      `${analysis.imagesWithoutAlt} image(s) sans description alternative (attribut alt)`
    );
  }

  if (analysis.headingStructure.h2 > 0 && analysis.headingStructure.h1 === 0) {
    createIssue("h2_without_h1", "HTML Structure", "medium");
  }

  return issues;
}

export function calculateSEOScore(analysis: HTMLAnalysis): number {
  let score = 100;

  if (!analysis.hasTitle) score -= 30;
  if (!analysis.hasMetaDescription) score -= 25;
  if (!analysis.hasViewportMeta) score -= 20;
  if (!analysis.hasCanonicalLink) score -= 10;
  if (analysis.headingStructure.h1 === 0) score -= 15;
  if (analysis.imagesWithoutAlt > 0)
    score -= Math.min(20, analysis.imagesWithoutAlt * 2);

  return Math.max(0, score);
}
