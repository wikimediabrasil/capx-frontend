/**
 * Gerador de Relatórios HTML de Performance
 *
 * Gera relatórios visuais com:
 * - Análise baseada nos padrões do Google Web Vitals
 * - Barras de progresso coloridas (verde/amarelo/vermelho)
 * - Sugestões automáticas de otimização
 * - Gráficos e comparações
 */

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
  wasRedirected?: boolean;
  finalUrl?: string;
}

// Thresholds do Google Core Web Vitals
const THRESHOLDS = {
  FCP: { good: 1800, needsImprovement: 3000 },      // ms
  LCP: { good: 2500, needsImprovement: 4000 },      // ms
  CLS: { good: 0.1, needsImprovement: 0.25 },       // score
  FID: { good: 100, needsImprovement: 300 },        // ms
  TTFB: { good: 600, needsImprovement: 1500 },      // ms
  loadTime: { good: 3000, needsImprovement: 5000 }, // ms
};

type ScoreLevel = 'good' | 'needs-improvement' | 'poor';

function getScore(metric: string, value: number): ScoreLevel {
  const threshold = THRESHOLDS[metric as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

function getScorePercentage(metric: string, value: number): number {
  const threshold = THRESHOLDS[metric as keyof typeof THRESHOLDS];
  if (!threshold) return 100;

  // Calcula percentual: 0-good = 100%, good-needs = 50-100%, >needs = 0-50%
  if (value <= threshold.good) {
    return 100;
  } else if (value <= threshold.needsImprovement) {
    const range = threshold.needsImprovement - threshold.good;
    const position = value - threshold.good;
    return 100 - (position / range) * 50;
  } else {
    // Após needsImprovement, degrada até 0%
    const excess = value - threshold.needsImprovement;
    const maxExcess = threshold.needsImprovement; // assume que 2x é muito ruim
    return Math.max(0, 50 - (excess / maxExcess) * 50);
  }
}

function getColorForScore(score: ScoreLevel): string {
  const colors = {
    good: '#0cce6b',
    'needs-improvement': '#ffa400',
    poor: '#ff4e42',
  };
  return colors[score];
}

function generateSuggestions(metrics: PerformanceMetrics[]): string[] {
  const suggestions: Set<string> = new Set();

  for (const metric of metrics) {
    const m = metric.metrics;

    // Análise de TTFB
    if (m.TTFB && m.TTFB > 600) {
      suggestions.add('🔧 **TTFB Alto**: Otimize queries no backend, adicione cache de servidor ou use CDN');
    }

    // Análise de FCP
    if (m.FCP && m.FCP > 1800) {
      suggestions.add('🎨 **FCP Lento**: Reduza JavaScript inicial, use code splitting e lazy loading de componentes');
    }

    // Análise de LCP
    if (m.LCP && m.LCP > 2500) {
      suggestions.add('🖼️ **LCP Alto**: Otimize imagens (WebP, lazy loading), pré-carregue recursos críticos');
    }

    // Análise de CLS
    if (m.CLS && m.CLS > 0.1) {
      suggestions.add('📐 **CLS Ruim**: Defina dimensões de imagens, reserve espaço para conteúdo dinâmico');
    }

    // Análise de Load Time
    if (m.loadTime && m.loadTime > 3000) {
      suggestions.add('⚡ **Load Time Lento**: Minifique assets, comprima respostas (gzip/brotli), remova dependências não usadas');
    }

    // Análise de DOM Content Loaded
    if (m.domContentLoaded && m.domContentLoaded > 2000) {
      suggestions.add('📦 **DOM Lento**: Reduza tamanho do HTML, evite scripts síncronos no <head>');
    }
  }

  return Array.from(suggestions);
}

function calculateAverages(metrics: PerformanceMetrics[]): Record<string, number> {
  const validMetrics = metrics.filter(m => !m.wasRedirected);
  if (validMetrics.length === 0) return {};

  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};

  for (const metric of validMetrics) {
    for (const [key, value] of Object.entries(metric.metrics)) {
      if (typeof value === 'number' && !isNaN(value)) {
        sums[key] = (sums[key] || 0) + value;
        counts[key] = (counts[key] || 0) + 1;
      }
    }
  }

  const averages: Record<string, number> = {};
  for (const key of Object.keys(sums)) {
    averages[key] = sums[key] / counts[key];
  }

  return averages;
}

function generateMetricBar(metric: string, value: number | undefined): string {
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
  const percentage = getScorePercentage(metric, value);
  const color = getColorForScore(score);
  const unit = metric === 'CLS' ? '' : 'ms';
  const threshold = THRESHOLDS[metric as keyof typeof THRESHOLDS];

  const labels = {
    good: '✓ Ótimo',
    'needs-improvement': '⚠ Regular',
    poor: '✗ Crítico',
  };

  return `
    <div class="metric-bar">
      <div class="metric-info">
        <span class="metric-name">${metric}</span>
        <span class="metric-value">${value.toFixed(0)}${unit}</span>
        <span class="metric-score ${score}">${labels[score]}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${percentage}%; background: ${color};"></div>
        <div class="threshold good" style="left: ${(threshold.good / (threshold.needsImprovement * 2)) * 100}%;"
             title="Bom: < ${threshold.good}${unit}"></div>
        <div class="threshold needs" style="left: ${(threshold.needsImprovement / (threshold.needsImprovement * 2)) * 100}%;"
             title="Regular: < ${threshold.needsImprovement}${unit}"></div>
      </div>
      <div class="threshold-labels">
        <span>0</span>
        <span class="good-label">${threshold.good}${unit}</span>
        <span class="needs-label">${threshold.needsImprovement}${unit}</span>
      </div>
    </div>
  `;
}

export function generateHTMLReport(results: PerformanceMetrics[]): string {
  const validResults = results.filter(r => !r.wasRedirected);
  const redirectedResults = results.filter(r => r.wasRedirected);

  const averages = calculateAverages(results);
  const suggestions = generateSuggestions(results);

  // Agrupa por rota
  const byRoute = results.reduce((acc, result) => {
    if (!acc[result.url]) acc[result.url] = [];
    acc[result.url].push(result);
    return acc;
  }, {} as Record<string, PerformanceMetrics[]>);

  // Calcula score geral
  const overallScores = ['FCP', 'LCP', 'CLS', 'TTFB', 'loadTime']
    .map(metric => {
      const avg = averages[metric];
      if (!avg) return null;
      return getScore(metric, avg);
    })
    .filter(Boolean);

  const goodCount = overallScores.filter(s => s === 'good').length;
  const overallScore = Math.round((goodCount / overallScores.length) * 100);

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Performance - CAPX</title>
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
      display: flex;
      justify-content: space-between;
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

    .timestamp {
      color: #6b7280;
      font-size: 0.9em;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📊 Relatório de Performance</h1>
      <div class="subtitle">CAPX Frontend - Análise de Web Vitals</div>
      <div class="timestamp">Gerado em: ${new Date().toLocaleString('pt-BR')}</div>
    </header>

    <div class="summary">
      <div class="summary-card">
        <div class="number">${results.length}</div>
        <div class="label">Testes Realizados</div>
      </div>
      <div class="summary-card">
        <div class="number">${validResults.length}</div>
        <div class="label">Rotas Válidas</div>
      </div>
      <div class="summary-card">
        <div class="number">${redirectedResults.length}</div>
        <div class="label">Redirecionadas</div>
      </div>
      <div class="summary-card">
        <div class="score-badge ${overallScore >= 80 ? 'good' : overallScore >= 50 ? 'needs-improvement' : 'poor'}">
          ${overallScore}%
        </div>
        <div class="label">Score Geral</div>
      </div>
    </div>

    <div class="content">
      ${redirectedResults.length > 0 ? `
        <section>
          <h2>⚠️ Rotas Redirecionadas (Possível Falha de Autenticação)</h2>
          <div class="warning">
            <div class="warning-title">Atenção!</div>
            As seguintes rotas foram redirecionadas e podem não estar autenticadas corretamente:
            <ul>
              ${redirectedResults.map(r => `<li><code>${r.url}</code> → <code>${r.finalUrl}</code></li>`).join('')}
            </ul>
          </div>
        </section>
      ` : ''}

      <section>
        <h2>📈 Métricas Gerais (Médias)</h2>
        ${generateMetricBar('FCP', averages.FCP)}
        ${generateMetricBar('LCP', averages.LCP)}
        ${generateMetricBar('CLS', averages.CLS)}
        ${generateMetricBar('TTFB', averages.TTFB)}
        ${generateMetricBar('loadTime', averages.loadTime)}
      </section>

      ${suggestions.length > 0 ? `
        <section>
          <h2>💡 Sugestões de Otimização</h2>
          <div class="suggestions">
            <strong>Baseado na análise das métricas, recomendamos:</strong>
            <ul>
              ${suggestions.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        </section>
      ` : ''}

      <section>
        <h2>🔍 Detalhes por Rota</h2>
        ${Object.entries(byRoute).map(([url, metrics]) => {
          const routeAvg = calculateAverages(metrics);
          return `
            <div class="route-card">
              <div class="route-header">
                <span class="route-url">${url}</span>
                <span>${metrics.length} teste(s)</span>
              </div>
              ${generateMetricBar('FCP', routeAvg.FCP)}
              ${generateMetricBar('LCP', routeAvg.LCP)}
              ${generateMetricBar('TTFB', routeAvg.TTFB)}
              ${generateMetricBar('loadTime', routeAvg.loadTime)}
            </div>
          `;
        }).join('')}
      </section>

      <section>
        <h2>📊 Dados Completos</h2>
        <table>
          <thead>
            <tr>
              <th>Rota</th>
              <th>Rede</th>
              <th>CPU</th>
              <th>Load Time</th>
              <th>FCP</th>
              <th>LCP</th>
              <th>TTFB</th>
            </tr>
          </thead>
          <tbody>
            ${results.map(r => `
              <tr>
                <td><code>${r.url}</code></td>
                <td>${r.networkProfile}</td>
                <td>${r.cpuThrottling}</td>
                <td>${r.metrics.loadTime?.toFixed(0) || 'N/A'}ms</td>
                <td>${r.metrics.FCP?.toFixed(0) || 'N/A'}ms</td>
                <td>${r.metrics.LCP?.toFixed(0) || 'N/A'}ms</td>
                <td>${r.metrics.TTFB?.toFixed(0) || 'N/A'}ms</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}
