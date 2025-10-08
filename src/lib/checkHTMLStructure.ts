/**
 * Analyseur HTML pour l'audit web
 * Vérifie la structure HTML, les balises meta, les titres et l'accessibilité
 */

import type { Page } from "puppeteer";
import type { HTMLAnalysis, AuditIssue } from "../types/report";

/**
 * Analyse la structure HTML d'une page
 * @param page Instance Puppeteer de la page
 * @returns Promise<HTMLAnalysis> Résultats de l'analyse HTML
 */
export async function analyzeHTMLStructure(page: Page): Promise<HTMLAnalysis> {
  const analysis = await page.evaluate(() => {
    // Vérification des balises meta essentielles
    const title = document.querySelector("title");
    const metaDescription = document.querySelector('meta[name="description"]');
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const canonicalLink = document.querySelector('link[rel="canonical"]');

    // Analyse de la structure des titres
    const headings = {
      h1: document.querySelectorAll("h1").length,
      h2: document.querySelectorAll("h2").length,
      h3: document.querySelectorAll("h3").length,
      h4: document.querySelectorAll("h4").length,
      h5: document.querySelectorAll("h5").length,
      h6: document.querySelectorAll("h6").length,
    };

    // Analyse des images
    const images = document.querySelectorAll("img");
    const imagesWithoutAlt = Array.from(images).filter(
      (img) => !img.alt || img.alt.trim() === ""
    ).length;

    return {
      hasTitle: !!title && title.textContent?.trim() !== "",
      hasMetaDescription:
        !!metaDescription &&
        metaDescription.getAttribute("content")?.trim() !== "",
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

/**
 * Génère les issues basées sur l'analyse HTML
 * @param analysis Résultats de l'analyse HTML
 * @returns AuditIssue[] Liste des issues détectées
 */
export function generateHTMLIssues(analysis: HTMLAnalysis): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // Vérification du titre
  if (!analysis.hasTitle) {
    issues.push({
      type: "SEO",
      message: "Titre de page manquant",
      severity: "high",
    });
  }

  // Vérification de la meta description
  if (!analysis.hasMetaDescription) {
    issues.push({
      type: "SEO",
      message: "Meta description manquante",
      severity: "high",
    });
  }

  // Vérification de la meta viewport
  if (!analysis.hasViewportMeta) {
    issues.push({
      type: "Best Practices",
      message: "Meta viewport manquante pour le responsive design",
      severity: "high",
    });
  }

  // Vérification du lien canonique
  if (!analysis.hasCanonicalLink) {
    issues.push({
      type: "SEO",
      message: "Lien canonique manquant",
      severity: "medium",
    });
  }

  // Vérification de la structure des titres
  if (analysis.headingStructure.h1 === 0) {
    issues.push({
      type: "HTML Structure",
      message: "Aucun titre H1 trouvé",
      severity: "high",
    });
  } else if (analysis.headingStructure.h1 > 1) {
    issues.push({
      type: "HTML Structure",
      message: "Plusieurs titres H1 trouvés (recommandé: un seul)",
      severity: "medium",
    });
  }

  // Vérification des images sans alt
  if (analysis.imagesWithoutAlt > 0) {
    issues.push({
      type: "Accessibility",
      message: `${analysis.imagesWithoutAlt} image(s) sans attribut alt`,
      severity: analysis.imagesWithoutAlt > 5 ? "high" : "medium",
    });
  }

  // Vérification de la hiérarchie des titres
  if (analysis.headingStructure.h2 > 0 && analysis.headingStructure.h1 === 0) {
    issues.push({
      type: "HTML Structure",
      message: "Titres H2 présents sans H1",
      severity: "medium",
    });
  }

  return issues;
}

/**
 * Calcule un score SEO basé sur l'analyse HTML
 * @param analysis Résultats de l'analyse HTML
 * @returns number Score SEO (0-100)
 */
export function calculateSEOScore(analysis: HTMLAnalysis): number {
  let score = 100;

  // Pénalités pour les éléments manquants
  if (!analysis.hasTitle) score -= 30;
  if (!analysis.hasMetaDescription) score -= 25;
  if (!analysis.hasViewportMeta) score -= 20;
  if (!analysis.hasCanonicalLink) score -= 10;
  if (analysis.headingStructure.h1 === 0) score -= 15;
  if (analysis.imagesWithoutAlt > 0)
    score -= Math.min(20, analysis.imagesWithoutAlt * 2);

  return Math.max(0, score);
}
