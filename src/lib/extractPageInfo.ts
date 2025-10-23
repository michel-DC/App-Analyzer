import type { Page } from "puppeteer";

export interface PageInfo {
  title: string;
  firstH1: string;
}

export async function extractPageInfo(page: Page): Promise<PageInfo> {
  try {
    const title = await page.title();

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

    return {
      title: "",
      firstH1: "",
    };
  }
}
