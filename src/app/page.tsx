export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full flex flex-col items-center">
        <div className="mb-4 flex items-center gap-2">
          <img
            src="/assets/search.svg"
            alt="App Analyzer Logo"
            className="h-8 w-8"
          />
          <h1 className="text-2xl font-bold text-black">App Analyzer</h1>
        </div>
        <p className="text-gray-700 text-center">
          Analysez rapidement la qualité et la performance de n&apos;importe
          quel site web.
          <br />
          Obtenez un rapport détaillé sur l&apos;accessibilité, le SEO, la
          structure HTML et la performance.
        </p>
      </div>
    </main>
  );
}
