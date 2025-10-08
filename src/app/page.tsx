export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo et titre */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img
              src="/assets/search.svg"
              alt="App Analyzer Logo"
              className="h-10 w-10"
            />
            <h1 className="text-4xl font-bold text-black">App Analyzer</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Outil d&apos;analyse technique pour développeurs.
            <br />
            Lighthouse • Puppeteer • Métriques de performance
          </p>
        </div>

        {/* Image centrale */}
        <div className="mb-16 flex justify-center">
          <div className="relative">
            <img
              src="/assets/server.svg"
              alt="Server Infrastructure"
              className="h-64 w-auto opacity-90"
            />
          </div>
        </div>
      </div>

      {/* Features techniques */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="p-6 rounded-lg bg-gray-50">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">Lighthouse</h3>
          <p className="text-gray-600 text-sm">
            Audit complet des performances, accessibilité et SEO
          </p>
        </div>

        <div className="p-6 rounded-lg bg-gray-50">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">Puppeteer</h3>
          <p className="text-gray-600 text-sm">
            Analyse automatisée de la structure HTML
          </p>
        </div>

        <div className="p-6 rounded-lg bg-gray-50">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">Métriques</h3>
          <p className="text-gray-600 text-sm">
            Temps de chargement, Core Web Vitals, optimisations
          </p>
        </div>
      </div>
    </main>
  );
}
