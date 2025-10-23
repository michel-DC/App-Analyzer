import type { Page } from "puppeteer";

export interface DetectedTechnology {
  name: string;
  category: "framework" | "cms" | "analytics" | "library" | "hosting" | "other";
  confidence: "high" | "medium" | "low";
}

export interface TechnologyDetection {
  technologies: DetectedTechnology[];
  siteType:
    | "ecommerce"
    | "blog"
    | "corporate"
    | "portfolio"
    | "landing"
    | "application"
    | "unknown";
  cms?: string;
  framework?: string;
}

export async function detectTechnologies(
  page: Page
): Promise<TechnologyDetection> {
  try {
    const detection = await page.evaluate(() => {
      const technologies: DetectedTechnology[] = [];
      let siteType: TechnologyDetection["siteType"] = "unknown";

      if (typeof window !== "undefined") {
        if ((window as any).React || (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
          technologies.push({
            name: "React",
            category: "framework",
            confidence: "high",
          });
        }

        if ((window as any).Vue || (window as any).__VUE__) {
          technologies.push({
            name: "Vue.js",
            category: "framework",
            confidence: "high",
          });
        }

        if ((window as any).angular || document.querySelector("[ng-app], [ng-version]")) {
          technologies.push({
            name: "Angular",
            category: "framework",
            confidence: "high",
          });
        }

        if ((window as any).next || document.querySelector('[id="__next"]')) {
          technologies.push({
            name: "Next.js",
            category: "framework",
            confidence: "high",
          });
        }

        if ((window as any).jQuery || (window as any).$) {
          technologies.push({
            name: "jQuery",
            category: "library",
            confidence: "high",
          });
        }

        if ((window as any).ga || (window as any).gtag || (window as any).dataLayer) {
          technologies.push({
            name: "Google Analytics",
            category: "analytics",
            confidence: "high",
          });
        }
      }

      const metaGenerator = document.querySelector('meta[name="generator"]');
      if (metaGenerator) {
        const content = metaGenerator.getAttribute("content")?.toLowerCase() || "";
        
        if (content.includes("wordpress")) {
          technologies.push({
            name: "WordPress",
            category: "cms",
            confidence: "high",
          });
          siteType = "blog";
        } else if (content.includes("shopify")) {
          technologies.push({
            name: "Shopify",
            category: "cms",
            confidence: "high",
          });
          siteType = "ecommerce";
        } else if (content.includes("wix")) {
          technologies.push({
            name: "Wix",
            category: "cms",
            confidence: "high",
          });
        } else if (content.includes("drupal")) {
          technologies.push({
            name: "Drupal",
            category: "cms",
            confidence: "high",
          });
        } else if (content.includes("joomla")) {
          technologies.push({
            name: "Joomla",
            category: "cms",
            confidence: "high",
          });
        }
      }

      const bodyClasses = document.body.className.toLowerCase();
      const htmlContent = document.documentElement.outerHTML.toLowerCase();

      if (
        bodyClasses.includes("wordpress") ||
        htmlContent.includes("wp-content") ||
        htmlContent.includes("wp-includes")
      ) {
        if (!technologies.find((t) => t.name === "WordPress")) {
          technologies.push({
            name: "WordPress",
            category: "cms",
            confidence: "medium",
          });
        }
        siteType = "blog";
      }

      if (htmlContent.includes("shopify") || htmlContent.includes("cdn.shopify")) {
        if (!technologies.find((t) => t.name === "Shopify")) {
          technologies.push({
            name: "Shopify",
            category: "cms",
            confidence: "medium",
          });
        }
        siteType = "ecommerce";
      }

      if (
        htmlContent.includes("woocommerce") ||
        htmlContent.includes("add-to-cart") ||
        htmlContent.includes("shopping-cart")
      ) {
        siteType = "ecommerce";
      }

      const hasArticles = document.querySelectorAll("article").length > 3;
      const hasBlogKeywords =
        htmlContent.includes("blog") ||
        htmlContent.includes("article") ||
        htmlContent.includes("post");
      if (hasArticles && hasBlogKeywords && siteType === "unknown") {
        siteType = "blog";
      }

      const hasServices =
        htmlContent.includes("service") || htmlContent.includes("solution");
      const hasAbout = htmlContent.includes("about") || htmlContent.includes("à propos");
      const hasContact =
        htmlContent.includes("contact") || htmlContent.includes("contactez");
      if (hasServices && hasAbout && hasContact && siteType === "unknown") {
        siteType = "corporate";
      }

      const hasPortfolio =
        htmlContent.includes("portfolio") ||
        htmlContent.includes("projets") ||
        htmlContent.includes("réalisations");
      const hasGallery =
        document.querySelectorAll(".gallery, .portfolio, .projects").length > 0;
      if ((hasPortfolio || hasGallery) && siteType === "unknown") {
        siteType = "portfolio";
      }

      const hasCTA =
        (htmlContent.match(/sign up|subscribe|register|inscription/gi) || [])
          .length > 2;
      const hasHero = document.querySelectorAll(".hero, .banner, .jumbotron")
        .length > 0;
      const hasOneMainCTA =
        document.querySelectorAll(
          'button[type="submit"], input[type="submit"], .cta'
        ).length <= 3;
      if (hasCTA && hasHero && hasOneMainCTA && siteType === "unknown") {
        siteType = "landing";
      }

      return {
        technologies,
        siteType,
      };
    });

    const cms = detection.technologies.find((t) => t.category === "cms")?.name;
    const framework = detection.technologies.find(
      (t) => t.category === "framework"
    )?.name;

    return {
      technologies: detection.technologies,
      siteType: detection.siteType,
      cms,
      framework,
    };
  } catch (error) {
    console.warn("Erreur lors de la détection des technologies:", error);
    return {
      technologies: [],
      siteType: "unknown",
    };
  }
}

export function getSiteTypeLabel(siteType: TechnologyDetection["siteType"]): string {
  const labels = {
    ecommerce: "Site e-commerce",
    blog: "Blog ou site d'actualités",
    corporate: "Site corporate / vitrine",
    portfolio: "Portfolio",
    landing: "Landing page",
    application: "Application web",
    unknown: "Type de site non déterminé",
  };
  return labels[siteType] || labels.unknown;
}

