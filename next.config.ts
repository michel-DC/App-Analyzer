import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour résoudre les problèmes de bundling avec Lighthouse
  webpack: (config, { isServer }) => {
    // Exclure Lighthouse et ses dépendances du bundling côté client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Exclure les modules problématiques du bundling
    config.externals = config.externals || [];
    config.externals.push({
      lighthouse: "commonjs lighthouse",
      puppeteer: "commonjs puppeteer",
    });

    // Ignorer les warnings de dépendances critiques
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Can't resolve 'fs'/,
      /Module not found: Can't resolve 'net'/,
      /Module not found: Can't resolve 'tls'/,
    ];

    return config;
  },

  // Configuration pour les packages externes du serveur
  serverExternalPackages: ["lighthouse", "puppeteer"],
};

export default nextConfig;
