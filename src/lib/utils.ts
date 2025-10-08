/**
 * Utilitaires communs pour l'audit web
 * Fonctions helper pour timeout, formattage et gestion d'erreurs
 */

/**
 * Timeout global pour l'audit (2 minutes)
 */
export const AUDIT_TIMEOUT = 120000; // 120 secondes

/**
 * Applique un timeout à une promesse
 * @param promise Promesse à exécuter
 * @param timeoutMs Timeout en millisecondes
 * @param timeoutMessage Message d'erreur en cas de timeout
 * @returns Promise<T> Résultat de la promesse ou erreur de timeout
 */
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

/**
 * Valide qu'une URL est valide
 * @param url URL à valider
 * @returns boolean True si l'URL est valide
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalise une URL (ajoute https:// si pas de protocole)
 * @param url URL à normaliser
 * @returns string URL normalisée
 */
export function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Calcule un score global basé sur les catégories
 * @param categories Scores par catégorie
 * @returns number Score global (0-100)
 */
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

/**
 * Génère un résumé court basé sur les issues trouvées
 * @param issues Liste des issues
 * @param score Score global
 * @returns string Résumé court
 */
export function generateShortSummary(
  issues: Array<{ type: string; severity: string }>,
  score: number
): string {
  if (score >= 90) {
    return "Excellent site avec de très bonnes performances.";
  }

  if (score >= 75) {
    return "Bon site avec quelques améliorations possibles.";
  }

  if (score >= 50) {
    return "Site correct mais nécessitant des optimisations importantes.";
  }

  return "Site nécessitant des améliorations majeures.";
}

/**
 * Génère des recommandations basées sur les issues
 * @param issues Liste des issues
 * @returns string[] Liste des recommandations
 */
export function generateRecommendations(
  issues: Array<{ type: string; message: string }>
): string[] {
  const recommendations: string[] = [];
  const seenTypes = new Set<string>();

  for (const issue of issues) {
    if (seenTypes.has(issue.type)) continue;
    seenTypes.add(issue.type);

    switch (issue.type) {
      case "SEO":
        recommendations.push(
          "Améliorer le SEO (meta descriptions, titres, structure)"
        );
        break;
      case "Performance":
        recommendations.push(
          "Optimiser les performances (images, chargement, cache)"
        );
        break;
      case "Accessibility":
        recommendations.push(
          "Améliorer l'accessibilité (alt text, contraste, navigation)"
        );
        break;
      case "Best Practices":
        recommendations.push("Appliquer les bonnes pratiques web");
        break;
      case "HTML Structure":
        recommendations.push("Améliorer la structure HTML");
        break;
    }
  }

  return recommendations;
}

/**
 * Gère les erreurs et retourne un message approprié
 * @param error Erreur capturée
 * @returns string Message d'erreur formaté
 */
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
