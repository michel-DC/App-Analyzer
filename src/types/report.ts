/**
 * Types TypeScript pour l'API d'audit web
 * Définit les interfaces pour les options d'audit, les rapports et les issues
 */

export interface AuditOptions {
  lighthouse: boolean;
  rowId?: string;
  company_email?: string;
}

export interface AuditIssue {
  type:
    | "SEO"
    | "Performance"
    | "Accessibility"
    | "Best Practices"
    | "HTML Structure";
  message: string;
  severity: "low" | "medium" | "high";
}

export interface AuditCategories {
  seo: number;
  performance: number;
  accessibility: number;
  bestPractices: number;
}

export interface AuditReport {
  status: "success" | "error";
  url: string;
  score: number;
  categories: AuditCategories;
  issues: AuditIssue[];
  shortSummary: string;
  recommendations: string[];
  message?: string; // Pour les cas d'erreur
  pageInfo?: {
    title: string;
    firstH1: string;
  };
  rowId?: string; // ID de ligne pour traçabilité
  company_email?: string; // Email de l'entreprise pour traçabilité
}

export interface LighthouseResult {
  performance: number;
  seo: number;
  accessibility: number;
  bestPractices: number;
}

export interface HTMLAnalysis {
  hasTitle: boolean;
  hasMetaDescription: boolean;
  hasMetaKeywords: boolean;
  headingStructure: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
  };
  imagesWithoutAlt: number;
  totalImages: number;
  hasViewportMeta: boolean;
  hasCanonicalLink: boolean;
}

export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  isMobileResponsive: boolean;
  isDesktopResponsive: boolean;
}

export interface AnalyzeRequest {
  url: string;
  options: AuditOptions;
}
