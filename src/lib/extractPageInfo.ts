/**
 * Extracteur d'informations de page
 * Extrait le titre de la page et le premier H1
 */

import type { Page } from "puppeteer";

/**
 * Interface pour les informations de page
 */
export interface PageInfo {
  title: string;
  firstH1: string;
}

/**
 * Extrait les informations de base de la page
 * @param page Instance Puppeteer de la page
 * @returns Promise<PageInfo> Informations de la page
 */
export async function extractPageInfo(page: Page): Promise<PageInfo> {
  try {
    // Extraction du titre de la page
    const title = await page.title();

    // Extraction du premier H1
    const firstH1 = await page.evaluate(() => {
      const h1Element = document.querySelector("h1");
      return h1Element ? h1Element.textContent?.trim() || "" : "";
    });

    return {
      title: title || "",
      firstH1: firstH1 || "",
    };
  } catch (error) {
    console.warn(
      "Erreur lors de l'extraction des informations de page:",
      error
    );

    // Retour de valeurs par défaut en cas d'erreur
    return {
      title: "",
      firstH1: "",
    };
  }
}
