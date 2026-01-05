#!/usr/bin/env node

/**
 * Script para gerar relatórios HTML a partir de arquivos JSON existentes
 *
 * Uso: node scripts/generate-html-report.js <arquivo-json>
 * Exemplo: node scripts/generate-html-report.js performance-reports/performance-2025-10-01.json
 */

const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  console.error('❌ Uso: node scripts/generate-html-report.js <arquivo-json>');
  console.error('   Exemplo: node scripts/generate-html-report.js performance-reports/performance-2025-10-01.json');
  process.exit(1);
}

const jsonPath = process.argv[2];

if (!fs.existsSync(jsonPath)) {
  console.error(`❌ Arquivo não encontrado: ${jsonPath}`);
  process.exit(1);
}

console.log(`📊 Gerando relatório HTML a partir de: ${jsonPath}`);

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Gerador inline (cópia da função generateHTMLReport)
function generateHTMLReport(results) {
  const THRESHOLDS = {
    FCP: { good: 1800, needsImprovement: 3000 },
    LCP: { good: 2500, needsImprovement: 4000 },
    CLS: { good: 0.1, needsImprovement: 0.25 },
    FID: { good: 100, needsImprovement: 300 },
    TTFB: { good: 600, needsImprovement: 1500 },
    loadTime: { good: 3000, needsImprovement: 5000 },
  };

  function getScore(metric, value) {
    const threshold = THRESHOLDS[metric];
    if (!threshold) return 'good';
    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  function getBarWidth(metric, value) {
    // This function calculates the width of the bar based on the actual value
    // relative to the scale (not the quality score)
    const threshold = THRESHOLDS[metric];
    if (!threshold) return 0;

    if (metric === 'CLS') {
      // CLS scale: 0 to 0.5
      const maxScale = 0.5;
      return Math.min((value / maxScale) * 100, 100);
    } else {
      // Time metrics scale: 0 to (needsImprovement * 2)
      const maxScale = threshold.needsImprovement * 2;
      return Math.min((value / maxScale) * 100, 100);
    }
  }

  function getScorePercentage(metric, value) {
    // This function is now only used for determining the quality score
    // Not for bar width
    const threshold = THRESHOLDS[metric];
    if (!threshold) return 100;

    if (value <= threshold.good) {
      return 100;
    } else if (value <= threshold.needsImprovement) {
      const range = threshold.needsImprovement - threshold.good;
      const position = value - threshold.good;
      return 100 - (position / range) * 50;
    } else {
      return 0; // Poor quality
    }
  }

  function getColorForScore(score) {
    const colors = {
      good: '#0cce6b',
      'needs-improvement': '#ffa400',
      poor: '#ff4e42',
    };
    return colors[score];
  }

  function getBackgroundColorForScore(score) {
    const bgColors = {
      good: '#d1fae5',
      'needs-improvement': '#fef3c7',
      poor: '#fee2e2',
    };
    return bgColors[score];
  }

  function getTextColorForScore(score) {
    const textColors = {
      good: '#065f46',
      'needs-improvement': '#92400e',
      poor: '#991b1b',
    };
    return textColors[score];
  }

  function formatTableCell(metric, value) {
    if (value === undefined || value === null || isNaN(value)) {
      return 'N/A';
    }

    const score = getScore(metric, value);
    const bgColor = getBackgroundColorForScore(score);
    const textColor = getTextColorForScore(score);
    const isCLS = metric === 'CLS';
    const formattedValue = isCLS ? value.toFixed(4) : value.toFixed(0);
    const unit = isCLS ? '' : 'ms';

    return `<span style="background: ${bgColor}; color: ${textColor}; padding: 4px 8px; border-radius: 4px; font-weight: 600; display: inline-block;">${formattedValue}${unit}</span>`;
  }

  function generateSuggestionsForRoute(url, metrics) {
    const suggestions = [];
    const m = metrics;

    // Specific suggestions based on route and metrics
    if (m.TTFB && m.TTFB > 600) {
      suggestions.push(`🔧 <strong>TTFB Alto (${m.TTFB.toFixed(0)}ms)</strong>: Optimize database queries for <code>${url}</code>, add server-side caching, or use a CDN`);
    }
    if (m.FCP && m.FCP > 1800) {
      suggestions.push(`🎨 <strong>FCP Slow (${m.FCP.toFixed(0)}ms)</strong>: Reduce initial JavaScript bundle for <code>${url}</code>, implement code splitting and lazy load non-critical components`);
    }
    if (m.LCP && m.LCP > 2500) {
      if (url.includes('profile') || url.includes('organization')) {
        suggestions.push(`🖼️ <strong>LCP High (${m.LCP.toFixed(0)}ms)</strong>: Optimize profile images on <code>${url}</code> (use WebP format, lazy loading), preload hero images`);
      } else if (url.includes('event')) {
        suggestions.push(`🖼️ <strong>LCP High (${m.LCP.toFixed(0)}ms)</strong>: Optimize event listing images on <code>${url}</code>, implement virtual scrolling for long lists`);
      } else if (url.includes('capacity') || url.includes('visualization')) {
        suggestions.push(`🖼️ <strong>LCP High (${m.LCP.toFixed(0)}ms)</strong>: Optimize chart rendering on <code>${url}</code>, use canvas instead of SVG for complex visualizations`);
      } else {
        suggestions.push(`🖼️ <strong>LCP High (${m.LCP.toFixed(0)}ms)</strong>: Optimize largest content element on <code>${url}</code>, preload critical resources`);
      }
    }
    if (m.CLS && m.CLS > 0.1) {
      if (url.includes('feed') || url.includes('home')) {
        suggestions.push(`📐 <strong>CLS Issue (${m.CLS.toFixed(4)})</strong>: Reserve space for dynamic feed content on <code>${url}</code>, set explicit dimensions for post images and cards`);
      } else if (url.includes('message')) {
        suggestions.push(`📐 <strong>CLS Issue (${m.CLS.toFixed(4)})</strong>: Stabilize message list on <code>${url}</code>, avoid layout shifts when loading conversations`);
      } else {
        suggestions.push(`📐 <strong>CLS Issue (${m.CLS.toFixed(4)})</strong>: Set fixed dimensions for images/components on <code>${url}</code>, avoid content shifting during load`);
      }
    }
    if (m.loadTime && m.loadTime > 3000) {
      suggestions.push(`⚡ <strong>Slow Load Time (${m.loadTime.toFixed(0)}ms)</strong>: Minify assets for <code>${url}</code>, enable gzip/brotli compression, reduce bundle size`);
    }
    if (m.domContentLoaded && m.domContentLoaded > 2000) {
      suggestions.push(`📦 <strong>DOM Loading Slow (${m.domContentLoaded.toFixed(0)}ms)</strong>: Reduce HTML size on <code>${url}</code>, defer non-critical scripts, remove blocking resources`);
    }

    return suggestions;
  }

  function generateSuggestions(metrics) {
    const suggestions = new Set();

    for (const metric of metrics) {
      const m = metric.metrics;

      if (m.TTFB && m.TTFB > 600) {
        suggestions.add('🔧 **TTFB High**: Optimize backend queries, add server caching, or use CDN');
      }
      if (m.FCP && m.FCP > 1800) {
        suggestions.add('🎨 **FCP Slow**: Reduce initial JavaScript, use code splitting and lazy loading');
      }
      if (m.LCP && m.LCP > 2500) {
        suggestions.add('🖼️ **LCP High**: Optimize images (WebP format, lazy loading), preload critical resources');
      }
      if (m.CLS && m.CLS > 0.1) {
        suggestions.add('📐 **CLS Issues**: Set image dimensions, reserve space for dynamic content');
      }
      if (m.loadTime && m.loadTime > 3000) {
        suggestions.add('⚡ **Slow Load Time**: Minify assets, enable compression (gzip/brotli), remove unused dependencies');
      }
    }

    return Array.from(suggestions);
  }

  function calculateAverages(metrics) {
    const validMetrics = metrics.filter(m => !m.wasRedirected);
    if (validMetrics.length === 0) return {};

    const sums = {};
    const counts = {};

    for (const metric of validMetrics) {
      for (const [key, value] of Object.entries(metric.metrics)) {
        if (typeof value === 'number' && !isNaN(value)) {
          sums[key] = (sums[key] || 0) + value;
          counts[key] = (counts[key] || 0) + 1;
        }
      }
    }

    const averages = {};
    for (const key of Object.keys(sums)) {
      averages[key] = sums[key] / counts[key];
    }

    return averages;
  }

  function generateMetricBar(metric, value) {
    if (value === undefined || isNaN(value)) {
      return `
        <div class="metric-bar">
          <div class="metric-info">
            <span class="metric-name">${metric}</span>
            <span class="metric-value">N/A</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 0%; background: #ccc;"></div>
          </div>
        </div>
      `;
    }

    const score = getScore(metric, value);
    const barWidth = getBarWidth(metric, value); // Width based on actual value on scale
    const color = getColorForScore(score);
    const isCLS = metric === 'CLS';
    const unit = isCLS ? '' : 'ms';
    const threshold = THRESHOLDS[metric];

    // Format value based on metric type
    const formattedValue = isCLS ? value.toFixed(4) : value.toFixed(0);

    // Calculate threshold positions for the bar
    // For CLS: scale is 0 to 0.5 (max expected CLS)
    // For time metrics: scale is 0 to (needsImprovement * 2)
    const maxScale = isCLS ? 0.5 : (threshold.needsImprovement * 2);
    const goodPosition = (threshold.good / maxScale) * 100;
    const needsPosition = (threshold.needsImprovement / maxScale) * 100;

    const labels = {
      good: '✓ Good',
      'needs-improvement': '⚠ Needs Improvement',
      poor: '✗ Poor',
    };

    return `
      <div class="metric-bar">
        <div class="metric-info">
          <span class="metric-name">${metric}</span>
          <span class="metric-value">${formattedValue}${unit}</span>
          <span class="metric-score ${score}">${labels[score]}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${barWidth}%; background: ${color};"></div>
          <div class="threshold good" style="left: ${goodPosition}%;"
               title="Good: < ${isCLS ? threshold.good.toFixed(2) : threshold.good}${unit}"></div>
          <div class="threshold needs" style="left: ${needsPosition}%;"
               title="Needs Improvement: < ${isCLS ? threshold.needsImprovement.toFixed(2) : threshold.needsImprovement}${unit}"></div>
        </div>
        <div class="threshold-labels">
          <span style="position: absolute; left: 0;">0</span>
          <span class="good-label" style="position: absolute; left: ${goodPosition}%; transform: translateX(-50%);">${isCLS ? threshold.good.toFixed(2) : threshold.good}${unit}</span>
          <span class="needs-label" style="position: absolute; left: ${needsPosition}%; transform: translateX(-50%);">${isCLS ? threshold.needsImprovement.toFixed(2) : threshold.needsImprovement}${unit}</span>
          ${isCLS ? `<span class="max-label" style="position: absolute; right: 0;">0.50</span>` : ''}
        </div>
      </div>
    `;
  }

  const validResults = results.filter(r => !r.wasRedirected);
  const redirectedResults = results.filter(r => r.wasRedirected);

  const averages = calculateAverages(results);
  const suggestions = generateSuggestions(results);

  // Group by route
  const byRoute = results.reduce((acc, result) => {
    if (!acc[result.url]) acc[result.url] = [];
    acc[result.url].push(result);
    return acc;
  }, {});

  // Group by scenario (network + CPU)
  const byScenario = results.reduce((acc, result) => {
    const scenarioKey = `${result.networkProfile} + ${result.cpuThrottling}`;
    if (!acc[scenarioKey]) {
      acc[scenarioKey] = {
        network: result.networkProfile,
        cpu: result.cpuThrottling,
        results: []
      };
    }
    acc[scenarioKey].results.push(result);
    return acc;
  }, {});

  const scenarios = Object.values(byScenario);

  // Calculate overall score
  const overallScores = ['FCP', 'LCP', 'CLS', 'TTFB', 'loadTime']
    .map(metric => {
      const avg = averages[metric];
      if (!avg) return null;
      return getScore(metric, avg);
    })
    .filter(Boolean);

  const goodCount = overallScores.filter(s => s === 'good').length;
  const overallScore = Math.round((goodCount / overallScores.length) * 100);

  // HTML Template completo (incluído inline para simplicidade)
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Performance Report - CAPX</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f5f5f5;
      color: #333;
      line-height: 1.6;
      padding: 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
    }

    h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }

    .subtitle {
      opacity: 0.9;
      font-size: 1.1em;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 40px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      text-align: center;
    }

    .summary-card .number {
      font-size: 2.5em;
      font-weight: bold;
      color: #667eea;
    }

    .summary-card .label {
      color: #6b7280;
      margin-top: 5px;
    }

    .score-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 1.2em;
    }

    .score-badge.good { background: #d1fae5; color: #065f46; }
    .score-badge.needs-improvement { background: #fef3c7; color: #92400e; }
    .score-badge.poor { background: #fee2e2; color: #991b1b; }

    .content {
      padding: 40px;
    }

    section {
      margin-bottom: 50px;
    }

    h2 {
      font-size: 1.8em;
      margin-bottom: 20px;
      color: #1f2937;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
    }

    h3 {
      font-size: 1.3em;
      margin: 30px 0 15px;
      color: #374151;
    }

    .metric-bar {
      margin-bottom: 25px;
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
    }

    .metric-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .metric-name {
      font-weight: 600;
      color: #374151;
      flex: 1;
    }

    .metric-value {
      font-size: 1.3em;
      font-weight: bold;
      color: #1f2937;
      margin: 0 15px;
    }

    .metric-score {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
    }

    .metric-score.good { background: #d1fae5; color: #065f46; }
    .metric-score.needs-improvement { background: #fef3c7; color: #92400e; }
    .metric-score.poor { background: #fee2e2; color: #991b1b; }

    .progress-bar {
      height: 20px;
      background: #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
      position: relative;
    }

    .progress-fill {
      height: 100%;
      transition: width 0.3s ease;
      border-radius: 10px;
    }

    .threshold {
      position: absolute;
      top: 0;
      height: 100%;
      width: 2px;
      background: rgba(0,0,0,0.3);
    }

    .threshold-labels {
      position: relative;
      height: 20px;
      margin-top: 5px;
      font-size: 0.75em;
      color: #6b7280;
    }

    .suggestions {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      border-radius: 8px;
    }

    .suggestions ul {
      list-style: none;
      margin-top: 15px;
    }

    .suggestions li {
      padding: 10px 0;
      border-bottom: 1px solid #fde68a;
    }

    .suggestions li:last-child {
      border-bottom: none;
    }

    .route-card {
      background: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
      border: 1px solid #e5e7eb;
    }

    .route-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
    }

    .route-url {
      font-family: 'Courier New', monospace;
      font-size: 1.2em;
      font-weight: bold;
      color: #667eea;
    }

    .warning {
      background: #fef3c7;
      border: 1px solid #fde68a;
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
    }

    .warning-title {
      font-weight: bold;
      color: #92400e;
      margin-bottom: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    th {
      background: #f3f4f6;
      font-weight: 600;
      color: #374151;
    }

    tr:hover {
      background: #f9fafb;
    }

    td {
      vertical-align: middle;
    }

    .timestamp {
      color: white;
      opacity: 0.8;
      font-size: 0.9em;
      margin-top: 10px;
    }

    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
      flex-wrap: wrap;
    }

    .tab {
      padding: 12px 20px;
      background: #f3f4f6;
      border: none;
      border-radius: 8px 8px 0 0;
      cursor: pointer;
      font-size: 0.95em;
      font-weight: 500;
      color: #6b7280;
      transition: all 0.3s ease;
    }

    .tab:hover {
      background: #e5e7eb;
      color: #374151;
    }

    .tab.active {
      background: #667eea;
      color: white;
      transform: translateY(2px);
    }

    .scenario-content {
      display: none;
    }

    .scenario-content.active {
      display: block;
    }

    .scenario-header {
      background: #f9fafb;
      padding: 15px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #667eea;
    }

    .scenario-title {
      font-size: 1.2em;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 5px;
    }

    .scenario-subtitle {
      color: #6b7280;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📊 Performance Report</h1>
      <div class="subtitle">CAPX Frontend - Web Vitals Analysis</div>
      <div class="timestamp">Generated at: ${new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })}</div>
    </header>

    <div class="summary">
      <div class="summary-card">
        <div class="number">${results.length}</div>
        <div class="label">Tests Performed</div>
      </div>
      <div class="summary-card">
        <div class="number">${validResults.length}</div>
        <div class="label">Valid Routes</div>
      </div>
      <div class="summary-card">
        <div class="number">${redirectedResults.length}</div>
        <div class="label">Redirected</div>
      </div>
      <div class="summary-card">
        <div class="score-badge ${overallScore >= 80 ? 'good' : overallScore >= 50 ? 'needs-improvement' : 'poor'}">
          ${overallScore}%
        </div>
        <div class="label">Overall Score</div>
      </div>
    </div>

    <div class="content">
      ${redirectedResults.length > 0 ? `
        <section>
          <h2>⚠️ Redirected Routes (Possible Authentication Failure)</h2>
          <div class="warning">
            <div class="warning-title">Warning!</div>
            The following routes were redirected and may not be properly authenticated:
            <ul>
              ${redirectedResults.map(r => `<li><code>${r.url}</code> → <code>${r.finalUrl}</code></li>`).join('')}
            </ul>
          </div>
        </section>
      ` : ''}

      <section>
        <h2>📈 Overall Metrics (Averages)</h2>
        ${generateMetricBar('FCP', averages.FCP)}
        ${generateMetricBar('LCP', averages.LCP)}
        ${generateMetricBar('CLS', averages.CLS)}
        ${generateMetricBar('TTFB', averages.TTFB)}
        ${generateMetricBar('loadTime', averages.loadTime)}
      </section>

      ${suggestions.length > 0 ? `
        <section>
          <h2>💡 Optimization Suggestions</h2>
          <div class="suggestions">
            <strong>Based on the metrics analysis, we recommend:</strong>
            <ul>
              ${suggestions.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        </section>
      ` : ''}

      <section>
        <h2>🔍 Details by Scenario</h2>
        <div class="tabs">
          ${scenarios.map((scenario, index) => `
            <button class="tab ${index === 0 ? 'active' : ''}" onclick="switchScenario(${index})">
              ${scenario.network} + ${scenario.cpu}
            </button>
          `).join('')}
        </div>

        ${scenarios.map((scenario, scenarioIndex) => {
          const scenarioKey = `${scenario.network} + ${scenario.cpu}`;
          const scenarioRoutes = scenario.results.reduce((acc, result) => {
            if (!acc[result.url]) acc[result.url] = [];
            acc[result.url].push(result);
            return acc;
          }, {});

          return `
            <div class="scenario-content ${scenarioIndex === 0 ? 'active' : ''}" id="scenario-${scenarioIndex}">
              <div class="scenario-header">
                <div class="scenario-title">${scenarioKey}</div>
                <div class="scenario-subtitle">${scenario.results.length} tests across ${Object.keys(scenarioRoutes).length} routes</div>
              </div>

              ${Object.entries(scenarioRoutes).map(([url, metrics]) => {
                const routeAvg = calculateAverages(metrics);
                const routeSuggestions = generateSuggestionsForRoute(url, routeAvg);
                return `
                  <div class="route-card">
                    <div class="route-header">
                      <span class="route-url">${url}</span>
                      <span>${metrics.length} test(s)</span>
                    </div>
                    ${generateMetricBar('FCP', routeAvg.FCP)}
                    ${generateMetricBar('LCP', routeAvg.LCP)}
                    ${generateMetricBar('CLS', routeAvg.CLS)}
                    ${generateMetricBar('TTFB', routeAvg.TTFB)}
                    ${generateMetricBar('loadTime', routeAvg.loadTime)}
                    ${routeSuggestions.length > 0 ? `
                      <div style="margin-top: 20px; padding: 15px; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 6px;">
                        <strong style="color: #92400e;">💡 Specific Recommendations:</strong>
                        <ul style="margin: 10px 0 0 20px; color: #78350f;">
                          ${routeSuggestions.map(s => `<li style="margin: 8px 0;">${s}</li>`).join('')}
                        </ul>
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }).join('')}
      </section>

      <section>
        <h2>📊 Complete Data</h2>
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Network</th>
              <th>CPU</th>
              <th>Load Time</th>
              <th>FCP</th>
              <th>LCP</th>
              <th>CLS</th>
              <th>TTFB</th>
            </tr>
          </thead>
          <tbody>
            ${results.map(r => `
              <tr>
                <td><code>${r.url}</code></td>
                <td>${r.networkProfile}</td>
                <td>${r.cpuThrottling}</td>
                <td>${formatTableCell('loadTime', r.metrics.loadTime)}</td>
                <td>${formatTableCell('FCP', r.metrics.FCP)}</td>
                <td>${formatTableCell('LCP', r.metrics.LCP)}</td>
                <td>${formatTableCell('CLS', r.metrics.CLS)}</td>
                <td>${formatTableCell('TTFB', r.metrics.TTFB)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>
    </div>
  </div>

  <script>
    function switchScenario(index) {
      // Hide all scenario contents
      document.querySelectorAll('.scenario-content').forEach(content => {
        content.classList.remove('active');
      });

      // Remove active from all tabs
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
      });

      // Show selected scenario
      document.getElementById('scenario-' + index).classList.add('active');

      // Activate selected tab
      document.querySelectorAll('.tab')[index].classList.add('active');

      // Scroll to scenario section
      document.querySelector('.scenario-content.active').scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  </script>
</body>
</html>
  `;

  return html;
}

const html = generateHTMLReport(data);
const htmlPath = jsonPath.replace('.json', '.html');

fs.writeFileSync(htmlPath, html);

console.log('✅ Relatório HTML gerado com sucesso!');
console.log(`   ${htmlPath}`);
console.log('\n💡 Abra o arquivo no navegador para visualizar o relatório visual completo!');
