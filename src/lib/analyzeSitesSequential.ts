import { analyzeSite } from "./analyzeSite";
import type { AuditReport, AuditOptions } from "../types/report";
import type { BatchAnalyzeItem } from "../types/report";

function analyzeSitesSequential(urls: string[], options: AuditOptions): Promise<AuditReport[]> {
  let results: AuditReport[] = [];
  return urls.reduce(async (accP, url) => {
    const acc = await accP;
    const report = await analyzeSite(url, options);
    acc.push(report);
    return acc;
  }, Promise.resolve(results));
}

function analyzeSitesSequentialMap(sites: BatchAnalyzeItem[]): Promise<AuditReport[]> {
  let results: AuditReport[] = [];
  return sites.reduce(async (accP, item) => {
    const acc = await accP;
    const report = await analyzeSite(item.url, item.options || { lighthouse: true });
    acc.push(report);
    return acc;
  }, Promise.resolve(results));
}

export { analyzeSitesSequential, analyzeSitesSequentialMap };
