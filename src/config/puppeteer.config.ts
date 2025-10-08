/**
 * Configuration Puppeteer pour l'audit web
 * Définit les options de lancement du navigateur pour l'analyse
 */

import puppeteer, { type LaunchOptions, type Browser } from "puppeteer";

export const PUPPETEER_OPTIONS: LaunchOptions = {
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--no-first-run",
    "--no-zygote",
    "--disable-gpu",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
  ],
  timeout: 30000, // 30 secondes pour le lancement
};

export const VIEWPORT_CONFIGS = {
  mobile: {
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  desktop: {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
} as const;

/**
 * Crée une nouvelle instance de navigateur Puppeteer
 * @returns Promise<Browser> Instance du navigateur
 */
export async function createBrowser(): Promise<Browser> {
  return await puppeteer.launch(PUPPETEER_OPTIONS);
}

/**
 * Configuration pour les tests de responsive design
 */
export const RESPONSIVE_TEST_CONFIG = {
  mobile: {
    viewport: VIEWPORT_CONFIGS.mobile,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
  },
  desktop: {
    viewport: VIEWPORT_CONFIGS.desktop,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  },
} as const;
