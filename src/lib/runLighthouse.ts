/**
 * Exécuteur Lighthouse pour l'audit web
 * Utilise le wrapper sécurisé pour éviter les problèmes de bundling
 */

import type { Page } from "puppeteer";
import type { LighthouseResult } from "../types/report";
import { runLighthouseSafe, generateLighthouseIssues as generateLighthouseIssuesSafe } from "./lighthouseWrapper";

/**
 * Exécute Lighthouse sur une page avec le wrapper sécurisé
 * @param page Instance Puppeteer de la page
 * @param url URL de la page à analyser
 * @returns Promise<LighthouseResult> Scores Lighthouse
 */
export async function runLighthouse(
  page: Page,
  url: string
): Promise<LighthouseResult> {
  return runLighthouseSafe(page, url);
}

/**
 * Génère des issues basées sur les scores Lighthouse
 * @param lighthouseResult Scores Lighthouse
 * @returns Array<{type: string, message: string, severity: string}> Issues générées
 */
export function generateLighthouseIssues(
  lighthouseResult: LighthouseResult
): Array<{
  type: string;
  message: string;
  severity: string;
}> {
  return generateLighthouseIssuesSafe(lighthouseResult);
}
