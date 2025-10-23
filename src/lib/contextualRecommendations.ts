import type { AuditIssue } from "../types/report";
import type { TechnologyDetection } from "./detectTechnologies";
import { getMessage } from "./messages";

export interface ContextualRecommendation {
  title: string;
  description: string;
  priority: "critique" | "important" | "amélioration";
  estimatedTime: string;
  impact: string;
}

export function generateContextualRecommendations(
  issues: AuditIssue[],
  siteType: TechnologyDetection["siteType"],
  cms?: string
): ContextualRecommendation[] {
  const recommendations: ContextualRecommendation[] = [];
  const seenKeys = new Set<string>();

  const priorityOrder: Record<string, number> = {
    critique: 1,
    important: 2,
    amélioration: 3,
  };

  const criticalIssues = issues
    .filter((issue) => issue.severity === "high")
    .sort((a, b) => {
      const aPriority = priorityOrder[a.priority || "amélioration"] || 3;
      const bPriority = priorityOrder[b.priority || "amélioration"] || 3;
      return aPriority - bPriority;
    });

  const importantIssues = issues.filter((issue) => issue.severity === "medium");
  const allSortedIssues = [...criticalIssues, ...importantIssues];

  for (const issue of allSortedIssues) {
    if (recommendations.length >= 7) break;

    const messageKey = issue.messageKey;
    if (!messageKey || seenKeys.has(messageKey)) continue;

    const message = getMessage(messageKey);
    if (!message) continue;

    seenKeys.add(messageKey);

    let estimatedTime = "15-30 minutes";
    if (
      messageKey.includes("mobile") ||
      messageKey.includes("performance") ||
      messageKey.includes("accessibility")
    ) {
      estimatedTime = "2-4 heures";
    }
    if (messageKey.includes("low_") || messageKey.includes("score")) {
      estimatedTime = "1-3 jours";
    }

    let contextualDescription = message.description;
    if (cms === "WordPress" && messageKey.includes("seo")) {
      contextualDescription +=
        " Avec WordPress, vous pouvez utiliser des plugins comme Yoast SEO ou Rank Math pour corriger facilement ces problèmes.";
    }
    if (cms === "Shopify" && siteType === "ecommerce") {
      contextualDescription +=
        " Pour votre boutique Shopify, ces optimisations peuvent directement augmenter vos ventes de 15 à 30%.";
    }

    recommendations.push({
      title: message.short,
      description: `${contextualDescription}\n\n${message.action}`,
      priority: message.priority,
      estimatedTime,
      impact: message.impact,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: "Site globalement bien optimisé",
      description:
        "Votre site respecte la plupart des bonnes pratiques web. Continuez à surveiller régulièrement vos performances et votre SEO pour maintenir ce niveau de qualité.",
      priority: "amélioration",
      estimatedTime: "Maintenance continue",
      impact: "Maintien de la qualité et des performances actuelles",
    });
  }

  return recommendations;
}

export function generateQuickWins(issues: AuditIssue[]): string[] {
  const quickWins: string[] = [];

  const quickWinKeys = [
    "missing_meta_description",
    "missing_viewport_meta",
    "missing_canonical_link",
    "missing_h1",
    "images_without_alt",
    "title_too_short",
    "title_too_long",
    "meta_description_too_short",
    "meta_description_too_long",
  ];

  for (const issue of issues) {
    if (quickWins.length >= 3) break;

    if (issue.messageKey && quickWinKeys.includes(issue.messageKey)) {
      const message = getMessage(issue.messageKey);
      if (message && message.codeExample) {
        quickWins.push(
          `${message.short} : ${message.action}\n\nExemple de code :\n${message.codeExample}`
        );
      } else if (message) {
        quickWins.push(`${message.short} : ${message.action}`);
      }
    }
  }

  return quickWins;
}

export function generateSiteTypeSpecificAdvice(
  siteType: TechnologyDetection["siteType"],
  issues: AuditIssue[]
): string {
  const hasPerformanceIssues = issues.some(
    (i) => i.type === "Performance" && i.severity === "high"
  );
  const hasSEOIssues = issues.some(
    (i) => i.type === "SEO" && i.severity === "high"
  );
  const hasAccessibilityIssues = issues.some(
    (i) => i.type === "Accessibility" && i.severity === "high"
  );

  switch (siteType) {
    case "ecommerce":
      return `Pour un site e-commerce, les performances sont critiques : chaque seconde de chargement supplémentaire peut réduire vos ventes de 7%. ${
        hasPerformanceIssues
          ? "Vos problèmes de performance actuels ont un impact direct sur votre chiffre d'affaires."
          : "Maintenez vos bonnes performances pour maximiser vos conversions."
      } ${
        hasSEOIssues
          ? "Le SEO est également crucial pour attirer du trafic qualifié gratuitement."
          : ""
      }`;

    case "blog":
      return `Pour un blog, le SEO est votre principal levier de croissance. ${
        hasSEOIssues
          ? "Corriger vos problèmes SEO peut multiplier votre trafic organique par 2 à 5."
          : "Continuez à optimiser votre SEO pour attirer plus de lecteurs."
      } La vitesse de chargement affecte également votre positionnement dans Google.`;

    case "corporate":
      return `Pour un site vitrine, l'image professionnelle et la crédibilité sont essentielles. ${
        hasAccessibilityIssues
          ? "Les problèmes d'accessibilité peuvent vous exposer à des risques juridiques et nuire à votre image."
          : ""
      } ${
        hasSEOIssues
          ? "Un bon SEO vous permettra d'être trouvé par vos prospects quand ils recherchent vos services."
          : ""
      }`;

    case "landing":
      return `Pour une landing page, l'objectif est la conversion. ${
        hasPerformanceIssues
          ? "Vos problèmes de performance font fuir les visiteurs avant même qu'ils voient votre offre."
          : "Maintenez une vitesse de chargement optimale pour maximiser vos conversions."
      } Chaque seconde compte pour transformer un visiteur en client.`;

    case "portfolio":
      return `Pour un portfolio, l'esthétique et les performances visuelles sont clés. ${
        hasPerformanceIssues
          ? "Des images lourdes ralentissent votre site et donnent une mauvaise impression."
          : "Continuez à optimiser vos images pour un rendu rapide et professionnel."
      } ${
        hasSEOIssues
          ? "Un bon SEO vous aidera à être trouvé par des clients potentiels."
          : ""
      }`;

    case "application":
      return `Pour une application web, la performance et l'accessibilité sont prioritaires. ${
        hasPerformanceIssues
          ? "Les ralentissements frustrent vos utilisateurs et les poussent vers la concurrence."
          : ""
      } ${
        hasAccessibilityIssues
          ? "L'accessibilité n'est pas optionnelle : elle garantit que tous vos utilisateurs peuvent utiliser votre application."
          : ""
      }`;

    default:
      return "Concentrez-vous d'abord sur les problèmes critiques (marqués en rouge) avant de passer aux optimisations moins urgentes.";
  }
}

