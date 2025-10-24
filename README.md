# App Analyzer - API d'Audit Web Automatique

Une API Next.js complète pour l'audit automatique de sites web utilisant Puppeteer et Lighthouse.

## 🚀 Fonctionnalités

- **Analyse HTML complète** : balises meta, structure des titres, attributs alt
- **Métriques de performance** : temps de chargement, FCP, LCP, responsive design
- **Intégration Lighthouse** : scores SEO, performance, accessibilité, bonnes pratiques
- **Extraction d'informations** : titre de page et premier H1 automatiquement extraits
- **Rapport JSON normalisé** : issues, recommandations, score global, informations de page
- **Gestion d'erreurs robuste** : timeout, validation, messages explicites
- **TypeScript strict** : typage complet, interfaces claires

## 📦 Installation

```bash
# Cloner le projet
git clone https://github.com/michel-DC/App-Analyzer.git
cd App-Analyzer

# Installer les dépendances avec pnpm
pnpm install

# Démarrer le serveur de développement
pnpm dev
```

L'API sera accessible sur `http://localhost:3000`

## 🔧 Dépendances

- **Next.js 15.5.4** - Framework React
- **TypeScript 5** - Typage statique
- **Puppeteer 24.23.0** - Automatisation navigateur
- **Lighthouse 12.8.2** - Audit de performance
- **Zod 4.1.12** - Validation de schémas
- **p-timeout 7.0.1** - Gestion des timeouts

## 🛠️ Architecture

```
src/
├── app/
│   └── api/analyze/route.ts   # Route API principale
├── lib/
│   ├── analyzeSite.ts          # Orchestrateur principal
│   ├── checkHTMLStructure.ts  # Analyseur HTML
│   ├── getPerformanceMetrics.ts # Métriques de performance
│   ├── runLighthouse.ts       # Exécuteur Lighthouse
│   ├── extractPageInfo.ts     # Extracteur titre/H1
│   ├── lighthouseWrapper.ts   # Wrapper sécurisé Lighthouse
│   └── utils.ts               # Utilitaires communs
├── types/
│   └── report.ts              # Interfaces TypeScript
└── config/
    └── puppeteer.config.ts    # Configuration Puppeteer
```

## 📡 Utilisation de l'API

### Endpoint Principal

```
POST /api/analyze
```

### Requête

```json
{
  "url": "https://exemple.com",
  "options": {
    "lighthouse": true,
    "rowId": "optional-row-identifier",
    "company_email": "contact@company.com"
  }
}
```

#### Paramètres de la requête

- **`url`** (string, requis) : URL du site à analyser
- **`options`** (object, optionnel) : Options d'analyse
  - **`lighthouse`** (boolean, défaut: true) : Activer l'analyse Lighthouse
  - **`rowId`** (string, optionnel) : Identifiant de ligne pour le suivi
  - **`company_email`** (string, optionnel) : Email de l'entreprise pour le suivi

### Réponse de Succès

```json
{
  "status": "success",
  "url": "https://exemple.com",
  "score": 82,
  "categories": {
    "seo": 90,
    "performance": 75,
    "accessibility": 85,
    "bestPractices": 80
  },
  "issues": [
    {
      "type": "SEO",
      "message": "Meta description manquante",
      "severity": "high"
    },
    {
      "type": "Performance",
      "message": "Images non optimisées",
      "severity": "medium"
    }
  ],
  "shortSummary": "Le site est correct, mais nécessite une optimisation d'images.",
  "recommendations": [
    "Ajouter une meta description",
    "Optimiser les images",
    "Améliorer le temps de chargement"
  ],
  "pageInfo": {
    "title": "Exemple - Site Web",
    "firstH1": "Bienvenue sur notre site"
  },
  "rowId": "optional-row-identifier",
  "company_email": "contact@company.com"
}
```

#### Champs de la réponse

- **`status`** (string) : "success" ou "error"
- **`url`** (string) : URL analysée
- **`score`** (number) : Score global (0-100)
- **`categories`** (object) : Scores par catégorie
  - **`seo`** (number) : Score SEO (0-100)
  - **`performance`** (number) : Score performance (0-100)
  - **`accessibility`** (number) : Score accessibilité (0-100)
  - **`bestPractices`** (number) : Score bonnes pratiques (0-100)
- **`issues`** (array) : Liste des problèmes détectés
- **`shortSummary`** (string) : Résumé de l'analyse
- **`recommendations`** (array) : Recommandations d'amélioration
- **`pageInfo`** (object) : Informations de la page
  - **`title`** (string) : Titre de la page
  - **`firstH1`** (string) : Premier titre H1
- **`rowId`** (string, optionnel) : Identifiant de ligne transmis
- **`company_email`** (string, optionnel) : Email entreprise transmis

### Réponse d'Erreur

```json
{
  "status": "error",
  "message": "Timeout: analyse trop longue"
}
```

## 🧪 Exemples d'Utilisation

### cURL

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://google.com",
    "options": {
      "lighthouse": true,
      "rowId": "audit-001",
      "company_email": "contact@company.com"
    }
  }'
```

### JavaScript/Fetch

```javascript
const response = await fetch("http://localhost:3000/api/analyze", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: "https://google.com",
    options: {
      lighthouse: true,
      rowId: "audit-001",
      company_email: "contact@company.com"
    },
  }),
});

const report = await response.json();
console.log(report);
```

### Python/Requests

```python
import requests

response = requests.post('http://localhost:3000/api/analyze', json={
    'url': 'https://google.com',
    'options': {
        'lighthouse': True,
        'rowId': 'audit-001',
        'company_email': 'contact@company.com'
    }
})

report = response.json()
print(report)
```

## ⚙️ Configuration

### Timeouts

- **Timeout global** : 2 minutes (120 secondes)
- **Timeout navigation** : 30 secondes
- **Timeout navigateur** : 30 secondes

### Viewports Testés

- **Mobile** : 375x667px
- **Desktop** : 1920x1080px

### Scores Lighthouse

- **Performance** : 0-100
- **SEO** : 0-100
- **Accessibility** : 0-100
- **Best Practices** : 0-100

## 📄 Informations de Page Extraites

L'API extrait automatiquement :

- **Titre de la page** : Contenu de la balise `<title>`
- **Premier H1** : Texte du premier élément `<h1>` de la page
- **Gestion d'erreurs** : Valeurs vides en cas d'absence d'éléments

Ces informations sont incluses dans le champ `pageInfo` de la réponse JSON.

## 🔍 Types d'Issues Détectées

### SEO

- Titre de page manquant
- Meta description manquante
- Lien canonique manquant
- Structure des titres incorrecte

### Performance

- Temps de chargement élevé
- First Contentful Paint élevé
- Largest Contentful Paint élevé
- Images non optimisées

### Accessibilité

- Images sans attribut alt
- Problèmes de contraste
- Navigation au clavier

### Best Practices

- Meta viewport manquante
- Site non responsive
- Problèmes de sécurité

## 🚨 Gestion d'Erreurs

L'API gère automatiquement :

- **Timeouts** : analyse trop longue
- **Sites inaccessibles** : DNS, connexion refusée
- **Erreurs de validation** : URL invalide, JSON malformé
- **Erreurs Lighthouse** : fallback sur scores par défaut

## 🏗️ Développement

```bash
# Lancer en mode développement
pnpm dev

# Build de production
pnpm build

# Lancer en production
pnpm start

# Linter
pnpm lint
```

## 📝 Notes Techniques

- **Puppeteer** : Lancement headless avec optimisations
- **Lighthouse** : Exécution asynchrone non-bloquante
- **TypeScript** : Typage strict, aucune utilisation d'`any`
- **Validation** : Schémas Zod pour toutes les entrées
- **Nettoyage** : Fermeture automatique des ressources

## 🔒 Sécurité

- Validation stricte des URLs
- Timeouts pour éviter les blocages
- Nettoyage automatique des ressources
- Gestion d'erreurs centralisée

## 📊 Métriques Surveillées

- **Temps de chargement** (loadTime)
- **DOM Content Loaded** (domContentLoaded)
- **First Contentful Paint** (firstContentfulPaint)
- **Largest Contentful Paint** (largestContentfulPaint)
- **Responsive Design** (mobile/desktop)
- **Structure HTML** (titres, meta, images)
- **Informations de page** (titre et premier H1)

---

**Développé avec ❤️ en TypeScript et Next.js**
