export const AUDIT_TIMEOUT = 120000; 

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = AUDIT_TIMEOUT,
  timeoutMessage: string = "Timeout: analyse trop longue"
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}

export function calculateOverallScore(categories: {
  seo: number;
  performance: number;
  accessibility: number;
  bestPractices: number;
}): number {
  const weights = {
    seo: 0.25,
    performance: 0.35,
    accessibility: 0.25,
    bestPractices: 0.15,
  };

  return Math.round(
    categories.seo * weights.seo +
      categories.performance * weights.performance +
      categories.accessibility * weights.accessibility +
      categories.bestPractices * weights.bestPractices
  );
}

export function generateShortSummary(
  issues: Array<{ type: string; severity: string }>,
  score: number
): string {
  const criticalIssues = issues.filter((i) => i.severity === "high").length;
  const mediumIssues = issues.filter((i) => i.severity === "medium").length;
  const totalIssues = issues.length;

  if (score >= 90) {
    if (totalIssues === 0) {
      return "Excellent travail ! Votre site respecte toutes les bonnes pratiques essentielles. Continuez à surveiller régulièrement vos performances pour maintenir ce niveau d'excellence.";
    }
    return `Votre site est très bien optimisé (score ${score}/100). ${totalIssues} point${
      totalIssues > 1 ? "s" : ""
    } mineur${
      totalIssues > 1 ? "s" : ""
    } à améliorer pour atteindre la perfection.`;
  }

  if (score >= 75) {
    return `Votre site est globalement bien conçu (score ${score}/100). Nous avons identifié ${criticalIssues} problème${
      criticalIssues > 1 ? "s" : ""
    } important${
      criticalIssues > 1 ? "s" : ""
    } et ${mediumIssues} point${
      mediumIssues > 1 ? "s" : ""
    } d'amélioration. En corrigeant ces éléments, vous pouvez significativement améliorer votre visibilité et l'expérience de vos visiteurs.`;
  }

  if (score >= 50) {
    const timeEstimate =
      criticalIssues > 5 ? "2 à 5 jours" : criticalIssues > 2 ? "1 à 2 jours" : "quelques heures";
    return `Votre site nécessite des optimisations importantes (score ${score}/100). ${criticalIssues} problème${
      criticalIssues > 1 ? "s" : ""
    } critique${
      criticalIssues > 1 ? "s" : ""
    } affecte${
      criticalIssues > 1 ? "nt" : ""
    } votre référencement et vos performances. Budget estimé de correction : ${timeEstimate} de travail. L'investissement en vaut la peine : ces corrections peuvent doubler votre trafic.`;
  }

  return `Votre site présente ${criticalIssues} problème${
    criticalIssues > 1 ? "s" : ""
  } majeur${
    criticalIssues > 1 ? "s" : ""
  } qui impacte${
    criticalIssues > 1 ? "nt" : ""
  } gravement votre visibilité et vos performances (score ${score}/100). Une refonte technique est fortement recommandée. Ces problèmes vous font perdre jusqu'à 70% de visiteurs potentiels. Consultez nos recommandations détaillées pour prioriser les actions correctives.`;
}

export function generateRecommendations(
  issues: Array<{ type: string; message: string; severity?: string; action?: string }>
): string[] {
  const recommendations: string[] = [];
  const criticalIssues = issues.filter((i) => i.severity === "high");
  const importantIssues = issues.filter((i) => i.severity === "medium");

  const priorityIssues = [...criticalIssues, ...importantIssues].slice(0, 7);

  for (const issue of priorityIssues) {
    if (issue.action) {
      recommendations.push(issue.action);
    } else {
      recommendations.push(issue.message);
    }
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Votre site respecte les bonnes pratiques principales. Continuez à surveiller régulièrement vos performances et votre SEO."
    );
    recommendations.push(
      "Pensez à tester régulièrement votre site sur différents navigateurs et appareils."
    );
    recommendations.push(
      "Mettez à jour régulièrement vos contenus pour maintenir votre positionnement dans Google."
    );
  }

  return recommendations;
}

export function handleError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("timeout")) {
      return "Timeout: analyse trop longue";
    }
    if (error.message.includes("net::ERR_NAME_NOT_RESOLVED")) {
      return "Site inaccessible: nom de domaine introuvable";
    }
    if (error.message.includes("net::ERR_CONNECTION_REFUSED")) {
      return "Site inaccessible: connexion refusée";
    }
    if (error.message.includes("net::ERR_TIMED_OUT")) {
      return "Site inaccessible: timeout de connexion";
    }
    return `Erreur: ${error.message}`;
  }
  return "Erreur inconnue lors de l'analyse";
}
