/**
 * Performance profiling script - MANUAL MODE
 *
 * This mode keeps the browser open and waits for you to manually log in.
 * After login, the script collects metrics from all routes without closing the browser.
 *
 * Usage: ts-node scripts/performance-profiling-manual.ts
 */

import fs from 'fs';
import path from 'path';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';

// Throttling configurations
const NETWORK_PROFILES = {
  'Fast 3G': {
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
    latency: 150,
  },
  'Slow 4G': {
    downloadThroughput: (4 * 1024 * 1024) / 8,
    uploadThroughput: (3 * 1024 * 1024) / 8,
    latency: 100,
  },
  'Slow WiFi': {
    downloadThroughput: (10 * 1024 * 1024) / 8,
    uploadThroughput: (5 * 1024 * 1024) / 8,
    latency: 50,
  },
};

const CPU_THROTTLING = {
  'Weak Hardware': 6,
  'Medium Hardware': 4,
  'Good Hardware': 2,
};

// Test IDs - UPDATE with real IDs from your application
const TEST_IDS = {
  // Public organization ID for testing
  organizationId: '186', // update with a real organization ID
};

const ROUTES = {
  public: [
    '/',
    '/events',
    '/organization_list',
    '/capacities_visualization',
    '/privacy_policy',
    '/terms',
  ],
  authenticated: [
    '/home',
    '/feed/saved',
    '/capacity',
    '/message',
    '/profile/edit',
    '/profile/badges',
    '/profile/lets_connect',
    '/report_bug',
    // Rotas dinâmicas com IDs de teste
    `/profile`,
    `/profile/edit`,
    `/organization_profile/${TEST_IDS.organizationId}`,
    `/organization_profile/${TEST_IDS.organizationId}/edit`,
  ],
};

interface PerformanceMetrics {
  url: string;
  networkProfile: string;
  cpuThrottling: string;
  metrics: {
    FCP?: number;
    LCP?: number;
    CLS?: number;
    FID?: number;
    TTFB?: number;
    loadTime?: number;
    domContentLoaded?: number;
    firstPaint?: number;
  };
  timestamp: string;
  wasRedirected: boolean;
  finalUrl: string;
}

class ManualPerformanceProfiler {
  private browser!: Browser;
  private context!: BrowserContext;
  private page!: Page;
  private results: PerformanceMetrics[] = [];
  private baseUrl: string;

  constructor(baseUrl: string = 'https://capx.toolforge.org') {
    this.baseUrl = baseUrl;
  }

  async waitForEnter(message: string): Promise<void> {
    console.log(message);
    return new Promise((resolve) => {
      process.stdin.once('data', () => {
        resolve();
      });
    });
  }

  async setup() {
    console.log('🚀 Starting browser...');
    this.browser = await chromium.launch({
      headless: false,
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });

    this.page = await this.context.newPage();
  }

  async waitForManualLogin() {
    console.log('\n' + '='.repeat(70));
    console.log('🔐 MANUAL MODE - LOG IN TO THE BROWSER');
    console.log('='.repeat(70));
    console.log('\n1. A browser has been opened at:', this.baseUrl);
    console.log('2. Manually log in using your MediaWiki credentials');
    console.log('3. Navigate to an authenticated page (e.g., /home)');
    console.log('4. Verify that you are successfully logged in');
    console.log('\n');

    await this.page.goto(this.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    await this.waitForEnter('\nPress ENTER when logged in and ready to start tests...');

    // Check if actually authenticated
    console.log('\n   Verifying authentication...');
    console.log('   Navigating to /home...');

    try {
      await this.page.goto(this.baseUrl + '/home', {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });

      // Aguarda um pouco para a página carregar
      await this.page.waitForTimeout(3000);

      const currentUrl = this.page.url();
      console.log(`   Current URL: ${currentUrl}`);

      if (currentUrl === this.baseUrl + '/home') {
        console.log('   ✅ Authentication confirmed!');
      } else if (currentUrl === this.baseUrl + '/' || currentUrl === this.baseUrl) {
        console.log('   ⚠️  Redirected to home - may not be authenticated');
        console.log('   ⚠️  But will continue with tests...');
      } else {
        console.log(`   ℹ️  Currently at: ${currentUrl}`);
        console.log('   Will continue with tests...');
      }
    } catch (error) {
      console.log('   ⚠️  Timeout verifying authentication, but will continue...');
      console.log(`   Error: ${(error as Error).message}`);
    }
  }

  async applyThrottling(networkProfile: keyof typeof NETWORK_PROFILES, cpuSlowdown: number) {
    // Apply CPU throttling via CDP
    const client = await this.context.newCDPSession(this.page);
    await client.send('Emulation.setCPUThrottlingRate', { rate: cpuSlowdown });

    // Apply network throttling via CDP (more reliable than route)
    const profile = NETWORK_PROFILES[networkProfile];
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: profile.downloadThroughput,
      uploadThroughput: profile.uploadThroughput,
      latency: profile.latency,
    });

    console.log(`   Throttling applied: ${networkProfile}, CPU ${cpuSlowdown}x slower`);
  }

  async removeThrottling() {
    const client = await this.context.newCDPSession(this.page);
    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
  }

  async measurePagePerformance(
    url: string,
    networkProfile: string,
    cpuThrottling: string
  ): Promise<PerformanceMetrics> {
    console.log(`\n📊 Testing: ${url}`);

    const targetUrl = this.baseUrl + url;

    // Set up Web Vitals observers BEFORE navigation
    await this.page.addInitScript(() => {
      (window as any).__webVitals = {
        LCP: null,
        CLS: 0,
      };

      // LCP Observer
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        (window as any).__webVitals.LCP = lastEntry.renderTime || lastEntry.loadTime;
      }).observe({ entryTypes: ['largest-contentful-paint'], buffered: true });

      // CLS Observer
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            (window as any).__webVitals.CLS += entry.value;
          }
        }
      }).observe({ entryTypes: ['layout-shift'], buffered: true });
    });

    await this.page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    const finalUrl = this.page.url();
    const wasRedirected = finalUrl !== targetUrl;

    if (wasRedirected) {
      console.log(`   ⚠️  Redirected to: ${finalUrl}`);
    }

    // Wait a bit for page to stabilize
    await this.page.waitForTimeout(1000);

    // Wait for loading component to disappear (if it exists)
    let hadLoading = false;
    try {
      const loadingElement = this.page.locator('[data-testid="simple-loading"]');
      // Check if loading is visible more robustly
      const isLoadingVisible = await loadingElement.isVisible({ timeout: 2000 }).catch(() => false);

      if (isLoadingVisible) {
        console.log(`   ⏳ Waiting for loading to disappear...`);
        await loadingElement.waitFor({ state: 'hidden', timeout: 60000 });
        console.log(`   ✓ Loading complete`);
        hadLoading = true;

        // After loading disappears, wait for real content to load
        console.log(`   ⏳ Waiting for real content to load after loading...`);

        // Wait for network idle with larger timeout
        await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
          console.log(`   ⚠️ Timeout waiting for networkidle, continuing...`);
        });

        // Wait long enough to ensure content has rendered
        console.log(`   ⏳ Waiting for complete rendering...`);
        await this.page.waitForTimeout(5000);
        console.log(`   ✓ Real content loaded`);
      }
    } catch (error) {
      console.log(` ${error} ⚠️ Timeout waiting for loading, continuing...`);
      // Loading not found or already disappeared, continue normally
    }

    // For profile and organization pages, wait for specific content to load
    if (url.includes('/profile') || url.includes('/organization_profile') || url.includes('/capacity')) {
      console.log(`   ⏳ Waiting for specific content to load...`);
      try {
        // Wait for at least one of the main elements to appear
        await this.page.waitForSelector('form, main, [role="main"], article, section', {
          state: 'visible',
          timeout: 30000,
        });

        // Wait for network idle again
        await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
          console.log(`   ⚠️ Timeout waiting for final networkidle, continuing...`);
        });

        // Additional time for final rendering
        await this.page.waitForTimeout(3000);
        console.log(`   ✓ Specific content loaded`);
      } catch (error) {
        console.log(` ${error} ⚠️ Timeout waiting for specific content, continuing...`);
      }
    }

    // Wait to ensure metrics are available
    await this.page.waitForTimeout(2000);

    // Collect metrics
    const metrics = await this.page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');

      const firstPaint = paintEntries.find((entry) => entry.name === 'first-paint')?.startTime;
      const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint')?.startTime;

      return {
        loadTime: perfData?.loadEventEnd - perfData?.fetchStart || 0,
        domContentLoaded: perfData?.domContentLoadedEventEnd - perfData?.fetchStart || 0,
        TTFB: perfData?.responseStart - perfData?.requestStart || 0,
        firstPaint: firstPaint || null,
        FCP: fcp || null,
      };
    });

    // Collect Web Vitals from the observers we set up before navigation
    const webVitals = await this.page.evaluate(() => {
      const vitals = (window as any).__webVitals || { LCP: null, CLS: 0 };

      // Also try to get LCP from performance entries as fallback
      if (!vitals.LCP) {
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint') as any[];
        if (lcpEntries.length > 0) {
          const lastLcp = lcpEntries[lcpEntries.length - 1];
          vitals.LCP = lastLcp.renderTime || lastLcp.loadTime;
        }
      }

      return vitals;
    });

    const result: PerformanceMetrics = {
      url,
      networkProfile,
      cpuThrottling,
      metrics: {
        ...metrics,
        ...(webVitals as any),
      },
      timestamp: new Date().toISOString(),
      wasRedirected,
      finalUrl,
    };

    this.results.push(result);

    console.log(`   ✓ Load: ${metrics.loadTime ? metrics.loadTime.toFixed(0) + 'ms' : 'N/A'}`);
    console.log(`   ✓ FCP: ${metrics.FCP ? metrics.FCP.toFixed(0) + 'ms' : 'N/A'}`);
    console.log(`   ✓ LCP: ${(webVitals as any).LCP ? (webVitals as any).LCP.toFixed(0) + 'ms' : 'N/A'}`);
    console.log(`   ✓ CLS: ${(webVitals as any).CLS !== undefined ? (webVitals as any).CLS.toFixed(4) : 'N/A'}`);
    console.log(`   ✓ TTFB: ${metrics.TTFB ? metrics.TTFB.toFixed(0) + 'ms' : 'N/A'}`);

    return result;
  }

  async runFullProfile(scenarios: 'all' | 'quick' = 'all') {
    await this.setup();
    await this.waitForManualLogin();

    const networkProfiles =
      scenarios === 'quick'
        ? (['Fast 3G'] as const)
        : (Object.keys(NETWORK_PROFILES) as (keyof typeof NETWORK_PROFILES)[]);

    const cpuProfiles =
      scenarios === 'quick'
        ? (['Hardware Médio'] as const)
        : (Object.keys(CPU_THROTTLING) as (keyof typeof CPU_THROTTLING)[]);

    const allRoutes = [...ROUTES.public, ...ROUTES.authenticated];

    console.log('\n🎯 Starting performance tests...');
    console.log(`📍 Routes: ${allRoutes.length}`);
    console.log(`🌐 Network profiles: ${networkProfiles.length}`);
    console.log(`💻 CPU profiles: ${cpuProfiles.length}`);
    console.log(`📊 Total tests: ${allRoutes.length * networkProfiles.length * cpuProfiles.length}\n`);

    for (const networkProfile of networkProfiles) {
      for (const cpuProfile of cpuProfiles) {
        const cpuSlowdown = CPU_THROTTLING[cpuProfile];

        console.log(`\n${'='.repeat(70)}`);
        console.log(`Scenario: ${networkProfile} + ${cpuProfile}`);
        console.log('='.repeat(70));

        await this.applyThrottling(networkProfile, cpuSlowdown);

        for (const route of allRoutes) {
          try {
            await this.measurePagePerformance(route, networkProfile, cpuProfile);
          } catch (error) {
            console.error(`❌ Error testing ${route}:`, error);
          }
        }

        await this.removeThrottling();
      }
    }

    await this.generateReport();
    await this.cleanup();
  }

  async generateReport() {
    const reportDir = path.join(process.cwd(), 'performance-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportDir, `performance-manual-${timestamp}.json`);

    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

    const mdReport = this.generateMarkdownReport();
    const mdPath = path.join(reportDir, `performance-manual-${timestamp}.md`);
    fs.writeFileSync(mdPath, mdReport);

    console.log(`\n✅ Reports generated:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   MD: ${mdPath}`);
    console.log(`\n📊 Generating visual HTML report...`);

    // Gera HTML usando import dinâmico
    try {
      const { execSync } = await import('child_process');
      const htmlPath = path.join(reportDir, `performance-manual-${timestamp}.html`);

      execSync(`node scripts/generate-html-report.js "${reportPath}"`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log(`   HTML: ${htmlPath}`);
      console.log(`\n💡 Open the HTML in your browser to view the complete report!`);
    } catch (error) {
      console.log(`   ⚠️  Error generating HTML: ${(error as Error).message}`);
      console.log(`   You can generate it manually: node scripts/generate-html-report.js "${reportPath}"`);
    }
  }

  generateMarkdownReport(): string {
    let report = '# Relatório de Performance (Modo Manual)\n\n';
    report += `**Data:** ${new Date().toLocaleString('pt-BR')}\n\n`;
    report += `**Total de testes:** ${this.results.length}\n\n`;

    // Identifica rotas redirecionadas
    const redirected = this.results.filter((r) => r.wasRedirected);
    if (redirected.length > 0) {
      report += '## ⚠️  Rotas Redirecionadas (Possível Falha de Autenticação)\n\n';
      report += '| Rota | URL Final |\n';
      report += '|------|----------|\n';
      for (const r of redirected) {
        report += `| ${r.url} | ${r.finalUrl} |\n`;
      }
      report += '\n';
    }

    // Agrupa por rota
    const byRoute = this.results.reduce(
      (acc, result) => {
        if (!acc[result.url]) acc[result.url] = [];
        acc[result.url].push(result);
        return acc;
      },
      {} as Record<string, PerformanceMetrics[]>
    );

    report += '## Resumo por Rota\n\n';

    for (const [url, metrics] of Object.entries(byRoute)) {
      report += `### ${url}\n\n`;
      report += '| Rede | CPU | Load Time | FCP | LCP | TTFB | Redirecionado |\n';
      report += '|------|-----|-----------|-----|-----|------|---------------|\n';

      for (const metric of metrics) {
        report += `| ${metric.networkProfile} | ${metric.cpuThrottling} | `;
        report += `${metric.metrics.loadTime?.toFixed(0) || 'N/A'}ms | `;
        report += `${metric.metrics.FCP?.toFixed(0) || 'N/A'}ms | `;
        report += `${metric.metrics.LCP?.toFixed(0) || 'N/A'}ms | `;
        report += `${metric.metrics.TTFB?.toFixed(0) || 'N/A'}ms | `;
        report += `${metric.wasRedirected ? '❌' : '✅'} |\n`;
      }

      report += '\n';
    }

    // Piores casos (apenas rotas não redirecionadas)
    const validResults = this.results.filter((r) => !r.wasRedirected);
    report += '## ⚠️  Rotas com Pior Performance (apenas rotas válidas)\n\n';
    const slowest = [...validResults]
      .sort((a, b) => (b.metrics.loadTime || 0) - (a.metrics.loadTime || 0))
      .slice(0, 5);

    report += '| Rota | Rede | CPU | Load Time |\n';
    report += '|------|------|-----|------------|\n';
    for (const metric of slowest) {
      report += `| ${metric.url} | ${metric.networkProfile} | ${metric.cpuThrottling} | `;
      report += `${metric.metrics.loadTime?.toFixed(0)}ms |\n`;
    }

    return report;
  }

  async cleanup() {
    console.log('\n🔍 Keeping browser open for inspection...');
    console.log('   Press Ctrl+C to close when finished.\n');

    // Wait indefinitely without closing the browser
    await new Promise(() => {}); // never resolves
  }
}

// Execution
const profiler = new ManualPerformanceProfiler();
const scenario = (process.argv[2] as 'quick' | 'all') || 'quick';

profiler.runFullProfile(scenario).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
