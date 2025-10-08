# 📊 Performance Profiling - CAPX Frontend

Script automatizado para análise de performance da aplicação em produção com diferentes condições de rede e hardware.

## 🎯 Funcionalidades

- ✅ Login automático via OAuth (MediaWiki)
- ✅ Testa rotas públicas e autenticadas
- ✅ Testa rotas dinâmicas (perfis e organizações)
- ✅ Simula condições de rede lenta (3G, 4G, Wifi)
- ✅ Simula hardware limitado (CPU throttling)
- ✅ Coleta métricas Web Vitals (FCP, LCP, CLS, FID, TTFB)
- ✅ Gera relatórios em JSON, Markdown e HTML visual

## 📋 Pré-requisitos

1. Instalar as dependências do Playwright:

```bash
yarn install
npx playwright install chromium
```

2. **Configurar IDs de teste** (opcional mas recomendado):

Edite os arquivos de profiling para usar IDs reais:

**`scripts/performance-profiling-manual.ts`** e **`scripts/performance-profiling.ts`**:

```typescript
const TEST_IDS = {
  profileId: 'me', // ou seu ID de usuário
  organizationId: '1', // ID de uma organização para testar
};
```

**Como encontrar IDs:**
- **Profile ID**: Após fazer login, vá em `/profile/edit` e veja o ID na URL
- **Organization ID**: Visite uma organização e copie o ID da URL (`/organization_profile/[id]`)

Se não configurar, o script usará IDs padrão que podem não existir.

## 🚀 Como Usar

### ⭐ Modo Manual (RECOMENDADO para rotas autenticadas)

**Importante:** O modo manual foi otimizado com timeouts maiores para lidar com rotas lentas e autenticação OAuth.

Este modo mantém o browser aberto e aguarda que você faça login manualmente. Ideal para testar rotas autenticadas corretamente.

```bash
yarn profile:manual
```

**Processo:**
1. Browser abre automaticamente
2. Você faz login manualmente com suas credenciais
3. Pressiona ENTER no terminal quando estiver logado
4. Script executa todos os testes mantendo a sessão ativa
5. Browser fica aberto para inspeção após os testes

**Cenários (modo manual quick):**
- 1 perfil de rede (Fast 3G)
- 1 perfil de CPU (Hardware Médio)
- 14 rotas (6 públicas + 8 autenticadas)
- **Total: ~14 testes** (5-10 minutos)

Para teste manual completo:
```bash
yarn profile:manual:full
```

### Modo Automático (apenas rotas públicas)

⚠️ **Nota:** O login OAuth do MediaWiki não persiste entre contextos do Playwright, então rotas autenticadas serão redirecionadas.

```bash
# Teste rápido
yarn profile:quick

# Teste completo
yarn profile
```

## 🔐 Processo de Login

1. O script abrirá automaticamente o browser
2. Navegará até https://capx.toolforge.org/
3. Clicará no botão de login
4. **ATENÇÃO:** Você precisará fazer login manualmente quando redirecionar para MediaWiki
5. Após login bem-sucedido, o script salvará a sessão e continuará automaticamente

## 📊 Relatórios Gerados

Os relatórios são salvos em `performance-reports/`:

### Gerar Relatório HTML Visual

Após executar o profiling, você pode gerar um relatório HTML interativo com visualizações:

```bash
node scripts/generate-html-report.js performance-reports/SEU-ARQUIVO.json
```

**O relatório HTML inclui:**
- ✅ Barras de progresso coloridas (verde/amarelo/vermelho)
- ✅ Score percentual baseado no Google Web Vitals
- ✅ Sugestões automáticas de otimização
- ✅ Comparação entre rotas
- ✅ Alertas de problemas

**Exemplo:**
```bash
# 1. Execute o profiling
yarn profile:manual

# 2. Gere o HTML visual
node scripts/generate-html-report.js performance-reports/performance-manual-2025-01-15.json

# 3. Abra no navegador
open performance-reports/performance-manual-2025-01-15.html
```

### 1. Relatório JSON (`performance-YYYY-MM-DD.json`)

Contém todas as métricas detalhadas:

```json
{
  "url": "/home",
  "networkProfile": "Fast 3G",
  "cpuThrottling": "Hardware Médio",
  "metrics": {
    "loadTime": 2341,
    "FCP": 1245,
    "LCP": 1876,
    "TTFB": 234,
    "CLS": 0.02,
    "domContentLoaded": 1987
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 2. Relatório Markdown (`performance-YYYY-MM-DD.md`)

Resumo legível com:
- Tabelas por rota com todas as métricas
- Top 5 rotas com pior performance
- Comparação entre diferentes condições

## 🎛️ Perfis de Teste

### Rede

| Perfil | Download | Upload | Latência |
|--------|----------|--------|----------|
| Fast 3G | 1.6 Mbps | 750 Kbps | 150ms |
| Slow 4G | 4 Mbps | 3 Mbps | 100ms |
| Wifi Lento | 10 Mbps | 5 Mbps | 50ms |

### CPU

| Perfil | Throttling |
|--------|------------|
| Hardware Fraco | 6x slower |
| Hardware Médio | 4x slower |
| Hardware Bom | 2x slower |

## 🔍 Métricas Coletadas

O script aguarda inteligentemente o loading desaparecer antes de coletar métricas, garantindo medições precisas do conteúdo real:

- **Load Time**: Tempo total de carregamento (após loading)
- **FCP** (First Contentful Paint): Primeiro conteúdo visível (real, não o loading)
- **LCP** (Largest Contentful Paint): Maior elemento visível
- **CLS** (Cumulative Layout Shift): Estabilidade visual
- **FID** (First Input Delay): Responsividade a interações
- **TTFB** (Time to First Byte): Tempo até primeiro byte do servidor
- **DOM Content Loaded**: Tempo até DOM estar pronto

### 🔄 Detecção Automática de Loading

O script detecta o componente `SimpleLoading` (via `data-testid="simple-loading"`) e aguarda seu desaparecimento. **Após o loading desaparecer, aguarda o estado `networkidle` para garantir que o conteúdo real carregue completamente**:

```
📊 Testando: /home
   ⏳ Aguardando loading desaparecer...
   ✓ Loading concluído
   ⏳ Aguardando conteúdo real carregar após loading...
   ✓ Conteúdo real carregado
   ✓ Load: 2341ms  ← Medido APÓS o conteúdo real carregar
   ✓ FCP: 2456ms   ← Conteúdo real, não o spinner
```

Para páginas de perfil e organização, há uma espera adicional por elementos específicos:

```
📊 Testando: /profile/edit
   ⏳ Aguardando loading desaparecer...
   ✓ Loading concluído
   ⏳ Aguardando conteúdo real carregar após loading...
   ✓ Conteúdo real carregado
   ⏳ Aguardando conteúdo específico de perfil/organização...
   ✓ Conteúdo específico carregado
```

Isso garante que as métricas refletem a experiência real do usuário, não apenas o tempo de carregamento do componente de loading.

## 🛠️ Customização

### Adicionar Novas Rotas

Edite `scripts/performance-profiling.ts`:

```typescript
const ROUTES = {
  public: [
    '/',
    '/events',
    // Adicione aqui
  ],
  authenticated: [
    '/home',
    '/feed/saved',
    // Adicione aqui
  ],
};
```

### Adicionar Novos Perfis de Rede

```typescript
const NETWORK_PROFILES = {
  '2G': {
    downloadThroughput: (250 * 1024) / 8,
    uploadThroughput: (50 * 1024) / 8,
    latency: 300,
  },
  // Adicione aqui
};
```

## 🐛 Troubleshooting

### Erro: "Login timeout"

- O script aguarda 2 minutos para login
- Se demorar mais, aumente o timeout em `route.ts:49`

### Erro: "Cannot find element"

- Verifique se o seletor do botão de login está correto
- O script procura por elementos com texto "login" (case insensitive)

### Browser não abre

```bash
# Reinstale os browsers do Playwright
npx playwright install --force
```

### Testes muito lentos

- Use `yarn profile:quick` para testes rápidos
- Remova perfis de rede/CPU que não são prioritários

## 📈 Interpretando Resultados

### Valores de Referência (Google)

| Métrica | Bom | Precisa Melhorar | Ruim |
|---------|-----|------------------|------|
| FCP | < 1.8s | 1.8s - 3s | > 3s |
| LCP | < 2.5s | 2.5s - 4s | > 4s |
| CLS | < 0.1 | 0.1 - 0.25 | > 0.25 |
| FID | < 100ms | 100ms - 300ms | > 300ms |

## 💡 Dicas

1. **Execute em horários de baixo tráfego** para resultados mais consistentes
2. **Feche outros programas** que possam interferir na rede
3. **Execute múltiplas vezes** e compare médias
4. **Foque nas rotas críticas** primeiro (home, feed, profile)
5. **Compare antes/depois** de otimizações

## 🔗 Recursos

- [Web Vitals Guide](https://web.dev/vitals/)
- [Playwright Docs](https://playwright.dev/)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
