export interface EnrichedMessage {
  short: string;
  description: string;
  impact: string;
  action: string;
  priority: "critique" | "important" | "amélioration";
  codeExample?: string;
  documentation?: string;
}

export interface MessageCatalog {
  [key: string]: EnrichedMessage;
}

export const MESSAGES: MessageCatalog = {
  missing_title: {
    short: "Titre de page manquant",
    description:
      "Le titre de votre page (balise <title>) est l'élément le plus important pour le référencement naturel. C'est ce qui apparaît en bleu dans les résultats de recherche Google et dans l'onglet du navigateur. Sans titre, votre page est pratiquement invisible pour les moteurs de recherche et vos visiteurs ne sauront pas de quoi parle votre site.",
    impact:
      "Impact SEO critique : Perte de 40 à 60% de visibilité organique sur Google. Taux de clic très faible dans les résultats de recherche.",
    action:
      "Ne laissez pas cette opportunité s'échapper ! Ajoutez dès maintenant une balise <title> stratégique dans votre section <head>. Imaginez ce titre comme votre vitrine numérique : 50-60 caractères maximum, avec vos mots-clés principaux qui attirent l'œil comme un aimant !",
    priority: "critique",
    codeExample:
      "<head>\n  <title>Nom de votre entreprise - Service principal | Ville</title>\n</head>",
    documentation:
      "https://developers.google.com/search/docs/appearance/title-link",
  },

  title_too_short: {
    short: "Titre de page trop court",
    description:
      "Votre titre de page contient moins de 30 caractères. Un titre trop court ne permet pas de décrire correctement votre contenu et limite votre potentiel de référencement. Google et vos visiteurs ont besoin de plus d'informations pour comprendre le sujet de votre page.",
    impact:
      "Impact SEO modéré : Opportunité manquée d'inclure des mots-clés importants. Taux de clic inférieur de 20 à 30%.",
    action:
      "Transformez ce titre trop discret en une accroche irrésistible ! Développez-le jusqu'à 50-60 caractères en y intégrant votre localisation, vos services phares... Pensez à ce que vos clients rêveraient de trouver sur Google !",
    priority: "important",
    codeExample:
      "<title>Plombier Paris 15 - Dépannage Urgence 24h/7j | Devis Gratuit</title>",
  },

  title_too_long: {
    short: "Titre de page trop long",
    description:
      "Votre titre de page dépasse 60 caractères. Google va le couper dans les résultats de recherche avec des points de suspension (...), ce qui nuit à votre message et peut dissuader les visiteurs de cliquer sur votre site.",
    impact:
      "Impact UX : Message tronqué dans Google. Perte potentielle de 10 à 15% de clics.",
    action:
      "Votre titre a du potentiel, mais il est trop bavard ! Réduisez-le à 50-60 caractères en gardant l'essentiel : votre nom, votre service principal, votre localisation. Soyez percutant comme une signature publicitaire !",
    priority: "important",
    codeExample:
      "<title>Coiffeur Bio Paris - Coupes & Colorations Naturelles</title>",
  },

  missing_meta_description: {
    short: "Meta description manquante",
    description:
      "La meta description est le texte qui apparaît sous le titre dans les résultats de recherche Google. C'est votre opportunité de convaincre les internautes de cliquer sur votre site plutôt que sur celui de vos concurrents. Sans description, Google affichera un extrait aléatoire de votre page, souvent peu engageant.",
    impact:
      "Impact SEO important : Baisse de 15 à 25% du taux de clic depuis Google. Moins de visiteurs sur votre site même si vous êtes bien positionné.",
    action:
      "Ne laissez pas Google choisir ce qu'il dit de vous ! Créez une meta description de 150-160 caractères qui donne envie de cliquer. C'est votre elevator pitch numérique : soyez persuasif, incluez vos atouts majeurs et un appel à l'action qui crée l'urgence !",
    priority: "critique",
    codeExample:
      '<meta name="description" content="Plombier certifié à Paris 15. Intervention rapide sous 30 min, devis gratuit. Dépannage chaudière, fuite d\'eau, débouchage. ☎ 01.XX.XX.XX.XX">',
  },

  meta_description_too_short: {
    short: "Meta description trop courte",
    description:
      "Votre meta description contient moins de 120 caractères. Vous n'utilisez pas tout l'espace disponible dans les résultats Google pour convaincre les internautes de visiter votre site. C'est une opportunité manquée de vous démarquer de vos concurrents.",
    impact:
      "Impact marketing : Vous laissez vos concurrents avec des descriptions complètes prendre l'avantage. Perte de 10 à 15% de clics potentiels.",
    action:
      "Vous avez de la place, utilisez-la ! Développez votre description jusqu'à 150-160 caractères. Ajoutez vos avantages exclusifs, vos garanties, un numéro qui rassure... Transformez les hésitants en clients !",
    priority: "important",
    codeExample:
      '<meta name="description" content="Restaurant italien authentique au cœur de Lyon. Pâtes fraîches maison, pizzas au feu de bois, produits bio. Terrasse ouverte. Réservation en ligne ou au 04.XX.XX.XX.XX">',
  },

  meta_description_too_long: {
    short: "Meta description trop longue",
    description:
      "Votre meta description dépasse 160 caractères. Google va la couper dans les résultats de recherche, et votre message sera tronqué avec des points de suspension (...). Les informations importantes à la fin ne seront pas visibles par les internautes.",
    impact:
      "Impact UX : Message incomplet dans les résultats Google. Perte de clarté et d'efficacité marketing.",
    action:
      "Votre message est bon mais trop long ! Coupez-le à 150-160 caractères en plaçant l'essentiel au début. Votre principal avantage, votre localisation stratégique, un appel court mais percutant !",
    priority: "important",
    codeExample:
      '<meta name="description" content="Expert-comptable Paris 11. Gestion complète de votre comptabilité : bilan, déclarations, conseil fiscal. Premier RDV gratuit. ☎ 01.XX.XX.XX.XX">',
  },

  missing_viewport_meta: {
    short: "Meta viewport manquante pour le responsive",
    description:
      "La balise viewport est indispensable pour que votre site s'affiche correctement sur les téléphones mobiles et tablettes. Sans elle, votre site sera affiché comme sur un ordinateur de bureau, avec des textes minuscules impossibles à lire et des boutons trop petits pour être cliqués. Plus de 60% des internautes naviguent depuis leur mobile.",
    impact:
      "Impact critique : Site illisible sur mobile. Perte de 50 à 70% des visiteurs mobiles qui quittent immédiatement. Pénalisation par Google dans les résultats de recherche mobile.",
    action:
      "Ne perdez pas la moitié de vos visiteurs ! Ajoutez immédiatement la balise viewport dans votre <head>. C'est la clé pour offrir une expérience mobile impeccable qui retient vos clients plutôt que de les faire fuir !",
    priority: "critique",
    codeExample:
      '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>',
  },

  missing_canonical_link: {
    short: "Lien canonique manquant",
    description:
      "Le lien canonique indique à Google quelle est la version principale de votre page si elle existe à plusieurs endroits (avec ou sans www, avec différents paramètres, etc.). Sans lien canonique, Google peut considérer que vous avez du contenu dupliqué, ce qui dilue votre référencement et peut même entraîner des pénalités.",
    impact:
      "Impact SEO modéré : Risque de contenu dupliqué aux yeux de Google. Dilution du référencement entre plusieurs versions de la même page. Perte de 10 à 20% d'efficacité SEO.",
    action:
      "Évitez que Google ne s'embrouille avec vos différentes URLs ! Ajoutez un lien canonique qui pointe vers votre URL principale. Ainsi, toute la puissance SEO se concentre sur une seule version de votre page !",
    priority: "important",
    codeExample:
      '<head>\n  <link rel="canonical" href="https://www.votresite.fr/votre-page">\n</head>',
  },

  missing_h1: {
    short: "Aucun titre H1 trouvé",
    description:
      "Le titre H1 est le titre principal de votre page, celui qui résume en quelques mots le sujet principal. C'est un repère essentiel pour Google et pour vos visiteurs. Sans H1, Google ne comprend pas bien de quoi parle votre page, et vos visiteurs sont désorientés.",
    impact:
      "Impact SEO important : Google ne peut pas identifier clairement le sujet de votre page. Perte de 20 à 30% d'efficacité sur votre mot-clé principal. Mauvaise expérience utilisateur.",
    action:
      "Donnez immédiatement un cap à votre page ! Ajoutez un H1 percutant qui résume votre contenu en incluant votre mot-clé principal. C'est comme le titre d'un livre : il doit immédiatement captiver et informer !",
    priority: "critique",
    codeExample: "<h1>Cours de yoga à Marseille - Débutants et confirmés</h1>",
  },

  multiple_h1: {
    short: "Plusieurs titres H1 trouvés",
    description:
      "Vous avez plusieurs balises H1 sur votre page. Le H1 doit être unique car c'est le titre principal qui identifie le sujet de la page. Avoir plusieurs H1 embrouille Google et dilue l'importance de vos mots-clés. C'est comme avoir plusieurs titres de couverture sur un livre.",
    impact:
      "Impact SEO modéré : Confusion pour Google sur le sujet principal de votre page. Dilution de 15 à 25% de l'impact de vos mots-clés principaux.",
    action:
      "Un seul H1 pour régner sur la concurrence ! Gardez votre titre principal en H1 et transformez les autres en H2 ou H3. Ainsi, Google comprendra parfaitement votre structure et vos mots-clés gagneront en puissance !",
    priority: "important",
    codeExample:
      "<h1>Titre principal de la page</h1>\n<h2>Première section</h2>\n<h3>Sous-section</h3>\n<h2>Deuxième section</h2>",
  },

  images_without_alt: {
    short: "Images sans description alternative",
    description:
      "Vos images n'ont pas d'attribut 'alt' qui décrit leur contenu. C'est problématique à plusieurs niveaux : les personnes malvoyantes utilisant un lecteur d'écran ne peuvent pas comprendre vos images, Google ne peut pas les indexer correctement, et si l'image ne charge pas, rien n'indique ce qu'elle devrait montrer.",
    impact:
      "Impact accessibilité et SEO : Exclusion des personnes malvoyantes (discrimination). Images invisibles pour Google (perte de référencement image). Non-conformité légale aux normes d'accessibilité.",
    action:
      "Rendez vos images parlantes pour tous ! Ajoutez un attribut 'alt' descriptif à chaque image importante. Pour Google, c'est une opportunité de référencement supplémentaire. Pour vos visiteurs, c'est une expérience inclusive et professionnelle !",
    priority: "critique",
    codeExample:
      '<img src="coiffeur-coupe.jpg" alt="Coiffeur réalisant une coupe moderne pour homme">\n<img src="decoration.svg" alt="">',
  },

  h2_without_h1: {
    short: "Titres H2 présents sans H1",
    description:
      "Votre page a des sous-titres (H2) mais pas de titre principal (H1). C'est comme avoir des chapitres dans un livre sans titre de livre. Cette structure illogique perturbe Google et rend la lecture moins fluide pour vos visiteurs. La hiérarchie des titres doit être respectée : H1 puis H2 puis H3.",
    impact:
      "Impact SEO et UX : Structure incohérente aux yeux de Google. Compréhension difficile du sujet principal. Perte d'environ 15% d'efficacité SEO.",
    action:
      "Commencez par le commencement ! Ajoutez un H1 avant vos H2 pour établir une hiérarchie claire. Votre page aura soudain beaucoup plus de sens pour Google et vos visiteurs suivront naturellement votre contenu !",
    priority: "important",
    codeExample:
      "<article>\n  <h1>Titre principal de l'article</h1>\n  <h2>Première section</h2>\n  <p>Contenu...</p>\n  <h2>Deuxième section</h2>\n</article>",
  },

  slow_load_time: {
    short: "Temps de chargement élevé",
    description:
      "Votre site met trop de temps à charger complètement. Au-delà de 3 secondes, les visiteurs commencent à partir : 40% abandonnent après 3 secondes, 60% après 5 secondes. De plus, Google pénalise les sites lents dans son classement. Un site lent vous fait perdre des clients et de l'argent.",
    impact:
      "Impact business critique : Perte de 20 à 40% de visiteurs avant même qu'ils voient votre site. Baisse du référencement Google. Perte de chiffre d'affaires directe.",
    action:
      "Vos visiteurs s'impatientent ! Optimisez vos images, activez la mise en cache, utilisez un hébergement performant. Chaque seconde gagnée, c'est des clients conservés et un meilleur classement Google !",
    priority: "critique",
    documentation: "https://web.dev/fast/",
  },

  slow_fcp: {
    short: "First Contentful Paint élevé",
    description:
      "Le First Contentful Paint (FCP) mesure le temps avant que le premier élément de votre page apparaisse à l'écran. Un FCP élevé signifie que vos visiteurs voient un écran blanc pendant plusieurs secondes, ce qui donne l'impression que votre site ne fonctionne pas. Beaucoup partent avant de voir quoi que ce soit.",
    impact:
      "Impact UX et conversion : Frustration des visiteurs face à l'écran blanc. Taux de rebond élevé (40% de départ avant affichage). Impression de site cassé ou lent.",
    action:
      "Faites disparaître cet écran blanc énervant ! Optimisez le chargement de vos ressources critiques. Vos visiteurs doivent voir du contenu en moins de 1.8 seconde, sinon ils pensent que votre site est en panne !",
    priority: "critique",
    documentation: "https://web.dev/fcp/",
  },

  slow_lcp: {
    short: "Largest Contentful Paint élevé",
    description:
      "Le Largest Contentful Paint (LCP) mesure le temps avant que l'élément principal de votre page soit visible (souvent une grande image ou un bloc de texte important). Un LCP élevé signifie que vos visiteurs attendent longtemps avant de voir votre contenu principal. C'est un critère de référencement Google majeur.",
    impact:
      "Impact SEO et UX majeur : Critère officiel de Google pour le classement. Mauvaise expérience utilisateur. Perte de 30 à 50% de visiteurs. Baisse de conversions.",
    action:
      "Votre contenu principal se fait désirer ! Optimisez votre image principale, utilisez un CDN, préchargez les ressources importantes. Montrez l'essentiel rapidement, sinon vos visiteurs partiront avant de découvrir votre valeur !",
    priority: "critique",
    documentation: "https://web.dev/lcp/",
  },

  high_cls: {
    short: "Changements de mise en page intempestifs",
    description:
      "Votre site a un Cumulative Layout Shift (CLS) élevé, ce qui signifie que des éléments se déplacent pendant le chargement. Par exemple : vous allez cliquer sur un bouton et il se déplace, vous cliquez au mauvais endroit. C'est très frustrant et Google le pénalise fortement.",
    impact:
      "Impact UX majeur : Frustration extrême des utilisateurs. Clics accidentels sur les mauvais boutons. Perte de confiance. Pénalisation Google pour l'expérience utilisateur.",
    action:
      "Stabilisez votre mise en page ! Réservez l'espace pour les images, évitez d'ajouter du contenu au-dessus. Vos visiteurs détestent quand les boutons bougent sous leurs doigts - offrez-leur une expérience stable et professionnelle !",
    priority: "important",
    documentation: "https://web.dev/cls/",
  },

  high_fid: {
    short: "Délai de réponse aux interactions élevé",
    description:
      "Votre site met du temps à répondre quand on clique sur un bouton ou qu'on remplit un formulaire. Le First Input Delay (FID) mesure ce temps de latence. Un FID élevé donne l'impression que votre site est gelé ou planté, ce qui fait fuir vos visiteurs.",
    impact:
      "Impact UX : Impression de site qui ne répond pas. Frustration lors de l'utilisation. Abandon des formulaires et des actions. Perte de conversions.",
    action:
      "Votre site ne doit pas faire la sourde oreille ! Réduisez votre JavaScript, découpez les tâches lourdes. Quand un visiteur clique, il attend une réponse immédiate - ne le décevez pas !",
    priority: "important",
    documentation: "https://web.dev/fid/",
  },

  not_mobile_responsive: {
    short: "Site non optimisé pour mobile",
    description:
      "Votre site ne s'affiche pas correctement sur les téléphones mobiles. Plus de 60% des internautes utilisent leur smartphone pour naviguer. Un site non responsive perd automatiquement la majorité de ses visiteurs potentiels. Google pénalise également fortement les sites non mobiles depuis 2018.",
    impact:
      "Impact business catastrophique : Perte de 60 à 80% des visiteurs mobiles. Pénalisation majeure par Google (mobile-first index). Taux de rebond supérieur à 90% sur mobile. Perte de chiffre d'affaires massive.",
    action:
      "Ne fermez pas la porte à la majorité de vos clients ! Passez au responsive design. Vos visiteurs mobiles représentent votre plus grand marché - donnez-leur une expérience adaptée à leur écran !",
    priority: "critique",
    documentation: "https://web.dev/responsive-web-design-basics/",
  },

  desktop_responsive_issues: {
    short: "Problèmes d'affichage sur desktop",
    description:
      "Votre site rencontre des problèmes d'affichage sur les écrans d'ordinateur de bureau : défilement horizontal, éléments qui dépassent, mise en page cassée. Bien que moins critique que les problèmes mobiles, cela affecte négativement l'expérience des utilisateurs desktop qui peuvent représenter 30 à 40% de vos visiteurs.",
    impact:
      "Impact UX modéré : Expérience dégradée pour 30-40% des visiteurs. Image non professionnelle. Difficulté de navigation et de lecture.",
    action:
      "Même sur desktop, l'apparence compte ! Testez votre site sur différentes résolutions, utilisez max-width, évitez les largeurs fixes. Offrez à tous vos visiteurs une expérience soignée et professionnelle !",
    priority: "important",
  },

  low_performance_score: {
    short: "Score de performance global faible",
    description:
      "Votre site obtient un score de performance global faible selon l'analyse Lighthouse de Google. Ce score synthétise plusieurs métriques : vitesse de chargement, interactivité, stabilité visuelle. Un score faible indique des problèmes multiples qui affectent gravement l'expérience de vos visiteurs et votre référencement.",
    impact:
      "Impact global : Combinaison de tous les problèmes de performance. Perte massive de trafic et de conversions. Pénalisation Google multi-facteurs.",
    action:
      "Votre site mérite mieux qu'une note médiocre ! Lancez un audit complet : optimisation images, mise en cache, CDN. Chaque point gagné sur votre score, c'est des visiteurs satisfaits et un meilleur classement !",
    priority: "critique",
    documentation: "https://pagespeed.web.dev/",
  },

  low_seo_score: {
    short: "Score SEO global faible",
    description:
      "Votre site obtient un score SEO faible, ce qui signifie qu'il n'est pas optimisé pour être bien référencé sur Google. Vous accumulez plusieurs problèmes : balises manquantes, structure incorrecte, contenu non optimisé. Résultat : vous êtes invisible dans les résultats de recherche et vos concurrents captent tout le trafic.",
    impact:
      "Impact business majeur : Invisibilité sur Google. Très peu de visiteurs organiques. Dépendance totale à la publicité payante. Perte de 70 à 90% du trafic potentiel.",
    action:
      "Sortez de l'ombre sur Google ! Corrigez vos balises meta, optimisez vos titres, améliorez votre structure. Le référencement naturel est votre meilleur commercial - donnez-lui les outils pour réussir !",
    priority: "critique",
    documentation: "https://developers.google.com/search/docs",
  },

  low_accessibility_score: {
    short: "Score d'accessibilité faible",
    description:
      "Votre site a de nombreux problèmes d'accessibilité qui empêchent les personnes handicapées de l'utiliser correctement. En France, c'est non seulement discriminatoire mais aussi illégal pour les sites publics et les grandes entreprises (obligation RGAA). Vous excluez environ 15% de la population.",
    impact:
      "Impact légal et éthique : Risque de poursuites juridiques (sites publics). Exclusion de 15% de clients potentiels. Mauvaise image de marque. Pénalisation possible par Google.",
    action:
      "Ouvrez votre site à tous ! Améliorez les contrastes, ajoutez des labels aux formulaires, structurez votre navigation. L'accessibilité n'est pas une option - c'est une marque de respect pour tous vos visiteurs !",
    priority: "critique",
    documentation: "https://www.w3.org/WAI/WCAG21/quickref/",
  },

  low_best_practices_score: {
    short: "Score de bonnes pratiques faible",
    description:
      "Votre site ne respecte pas les bonnes pratiques web modernes : problèmes de sécurité (HTTPS, bibliothèques obsolètes), erreurs dans la console, problèmes de compatibilité navigateurs. Ces problèmes techniques donnent une impression de site amateur et peu fiable, et peuvent présenter des risques de sécurité.",
    impact:
      "Impact sécurité et crédibilité : Risques de piratage. Perte de confiance des visiteurs. Avertissements de sécurité dans les navigateurs. Dysfonctionnements possibles.",
    action:
      "Montrez que vous êtes sérieux ! Passez en HTTPS, mettez à jour vos bibliothèques, corrigez les erreurs. Un site techniquement solide inspire confiance à vos visiteurs et à Google !",
    priority: "important",
    documentation: "https://web.dev/lighthouse-best-practices/",
  },

  lighthouse_failed: {
    short: "Analyse Lighthouse non disponible",
    description:
      "L'outil d'analyse avancée Lighthouse de Google n'a pas pu analyser votre site. Cela peut être dû à un site inaccessible, trop lent, ou des problèmes techniques. Les scores d'accessibilité et de bonnes pratiques ne sont donc pas disponibles, seule une analyse de base a pu être effectuée.",
    impact:
      "Impact : Analyse incomplète. Impossibilité d'évaluer certains critères importants. Recommandation : vérifier l'accessibilité et la stabilité de votre site.",
    action:
      "Même Lighthouse n'arrive pas à analyser votre site ! Vérifiez son accessibilité, optimisez sa vitesse. Un site stable et rapide est la base de toute analyse sérieuse !",
    priority: "important",
  },

  missing_open_graph: {
    short: "Balises Open Graph manquantes",
    description:
      "Les balises Open Graph contrôlent comment votre site apparaît quand il est partagé sur les réseaux sociaux (Facebook, LinkedIn, etc.). Sans ces balises, le partage affiche souvent un aperçu laid et peu engageant : pas d'image, texte mal formaté. Vous perdez beaucoup de clics potentiels depuis les réseaux sociaux.",
    impact:
      "Impact marketing : Partages sociaux peu attractifs. Perte de 50 à 70% de clics depuis les réseaux sociaux. Visibilité sociale très faible.",
    action:
      "Ne ratez pas l'occasion de briller sur les réseaux sociaux ! Ajoutez les balises Open Graph essentielles. Votre site mérite un bel aperçu quand il est partagé - c'est votre carte de visite sociale !",
    priority: "amélioration",
    codeExample:
      '<meta property="og:title" content="Votre titre">\n<meta property="og:description" content="Votre description">\n<meta property="og:image" content="https://votresite.fr/image.jpg">\n<meta property="og:url" content="https://votresite.fr/page">',
  },

  missing_structured_data: {
    short: "Données structurées manquantes",
    description:
      "Les données structurées (Schema.org) permettent à Google de mieux comprendre votre contenu et d'afficher des résultats enrichis : étoiles d'avis, prix, disponibilité, FAQ, etc. Sans elles, vous passez à côté d'une meilleure visibilité dans Google et d'un taux de clic supérieur.",
    impact:
      "Impact SEO : Perte des rich snippets (résultats enrichis). Taux de clic inférieur de 20 à 30%. Moins de visibilité que les concurrents.",
    action:
      "Dépassez vos concurrents dans les résultats Google ! Implémentez les données structurées adaptées à votre activité. Les rich snippets attirent naturellement l'œil et augmentent votre taux de clic !",
    priority: "amélioration",
    documentation: "https://schema.org/",
  },
};

export function getMessage(key: string): EnrichedMessage | null {
  return MESSAGES[key] || null;
}

export function getMessageShort(key: string): string {
  return MESSAGES[key]?.short || "Problème détecté";
}

export function getAllMessages(): MessageCatalog {
  return MESSAGES;
}
