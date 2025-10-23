import type { Page } from "puppeteer";
import type { LighthouseResult } from "../types/report";
import { runLighthouseSafe, generateLighthouseIssues as generateLighthouseIssuesSafe } from "./lighthouseWrapper";
 
export async function runLighthouse(
  page: Page,
  url: string
): Promise<LighthouseResult> {
  return runLighthouseSafe(page, url);
}

export function generateLighthouseIssues(
  lighthouseResult: LighthouseResult
): Array<{
  type: string;
  message: string;
  severity: string;
  messageKey?: string;
  priority?: "critique" | "important" | "amélioration";
  description?: string;
  impact?: string;
  action?: string;
}> {
  return generateLighthouseIssuesSafe(lighthouseResult);
}
