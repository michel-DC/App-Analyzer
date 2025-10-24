import type { LaunchOptions, Browser } from "puppeteer";
import { execSync } from "child_process";
import { existsSync } from "fs";

const isProduction = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1";

function findChromeExecutable(): string | undefined {
  const possiblePaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe",
  ];

  for (const path of possiblePaths) {
    if (path && existsSync(path)) {
      return path;
    }
  }

  try {
    const result = execSync(
      'reg query "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe" /ve',
      { encoding: "utf8" }
    );
    const match = result.match(/REG_SZ\s+(.+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  } catch {
    console.warn("Could not find Chrome in registry");
  }

  return undefined;
}

export async function getPuppeteerOptions(): Promise<LaunchOptions> {
  const baseOptions: LaunchOptions = {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
    ],
    timeout: 30000,
  };

  if (isProduction || isVercel) {
    const chromium = await import("@sparticuz/chromium");
    
    chromium.default.setHeadlessMode = true;
    chromium.default.setGraphicsMode = false;
    
    return {
      ...baseOptions,
      args: [
        ...baseOptions.args!,
        ...chromium.default.args,
        "--disable-extensions",
        "--disable-plugins",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--single-process",
        "--disable-software-rasterizer",
        "--disable-dev-tools",
        "--disable-sync",
        "--disable-translate",
        "--hide-scrollbars",
        "--mute-audio",
        "--disable-default-apps",
        "--no-default-browser-check",
        "--disable-background-networking",
        "--disable-breakpad",
        "--disable-client-side-phishing-detection",
        "--disable-component-extensions-with-background-pages",
        "--disable-features=AudioServiceOutOfProcess,IsolateOrigins,site-per-process",
        "--disable-hang-monitor",
        "--disable-ipc-flooding-protection",
        "--disable-popup-blocking",
        "--disable-prompt-on-repost",
        "--metrics-recording-only",
        "--safebrowsing-disable-auto-update",
        "--enable-automation",
        "--password-store=basic",
        "--use-mock-keychain",
        "--disable-blink-features=AutomationControlled",
        "--memory-pressure-off",
      ],
      executablePath: await chromium.default.executablePath(),
      ignoreDefaultArgs: ["--disable-extensions"],
      protocolTimeout: 60000,
    };
  }

  const chromePath = findChromeExecutable();
  if (chromePath) {
    console.log("Using Chrome at:", chromePath);
    return {
      ...baseOptions,
      executablePath: chromePath,
    };
  }

  return baseOptions;
}

export const VIEWPORT_CONFIGS = {
  mobile: {
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  desktop: {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
} as const;

export async function createBrowser(): Promise<Browser> {
  const options = await getPuppeteerOptions();
  
  if (isProduction || isVercel) {
    const puppeteerCore = await import("puppeteer-core");
    return await puppeteerCore.default.launch(options);
  }
  
  const puppeteer = await import("puppeteer");
  return await puppeteer.default.launch(options);
}

export const RESPONSIVE_TEST_CONFIG = {
  mobile: {
    viewport: VIEWPORT_CONFIGS.mobile,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
  },
  desktop: {
    viewport: VIEWPORT_CONFIGS.desktop,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  },
} as const;
