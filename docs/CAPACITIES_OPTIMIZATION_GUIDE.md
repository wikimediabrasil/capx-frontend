# Guia de Otimização de Requisições de Capacidades

Este documento descreve as melhorias implementadas no sistema de requisições de capacidades e como migrar componentes existentes para usar a nova abordagem otimizada.

## Problema Resolvido

O sistema anterior fazia requisições redundantes à API de capacidades em diferentes partes da aplicação, causando:

- Múltiplas chamadas à API para os mesmos dados
- Experiência de usuário inconsistente (carregamentos repetidos)
- Uso excessivo de recursos do servidor e cliente
- Possível degradação de performance em conexões lentas

## Solução Implementada

Implementamos uma solução que utiliza React Query para:

1. **Cachear respostas de API** por um período configurável
2. **Evitar requisições redundantes** para os mesmos dados
3. **Permitir invalidação seletiva do cache** quando necessário
4. **Implementar pré-carregamento** de dados que serão utilizados em breve
5. **Compartilhar dados entre componentes** sem requisições adicionais

## Como Migrar Componentes Existentes

### 1. De `useCapacities` Antigo para o Novo

#### Antes:

```tsx
// Componente usando o hook antigo
import { useCapacities } from "@/hooks/useCapacities";

function MyComponent() {
  const { capacities, isLoading, error } = useCapacities();

  // Usar todas as capacidades de uma vez
  return (
    <div>
      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <ul>
          {capacities.map((capacity) => (
            <li key={capacity.code}>{capacity.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

#### Depois:

```tsx
// Componente usando o hook novo
import { useCapacities } from "@/hooks/useCapacities";

function MyComponent() {
  const { useAllCapacities } = useCapacities();
  const { data: capacities, isLoading, error } = useAllCapacities();

  return (
    <div>
      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <ul>
          {capacities?.map((capacity) => (
            <li key={capacity.code}>{capacity.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 2. Obtendo Apenas Capacidades Específicas

Se você só precisa de capacidades de um tipo específico (como capacidades raiz ou subcapacidades), use os hooks específicos:

```tsx
// Componente que mostra apenas capacidades raiz
function RootCapacitiesComponent() {
  const { rootCapacities, isLoadingRootCapacities } = useCapacities();

  return (
    <div>
      {isLoadingRootCapacities ? (
        <p>Carregando...</p>
      ) : (
        <ul>
          {rootCapacities.map((capacity) => (
            <li key={capacity.code}>{capacity.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Componente que mostra subcapacidades de um parent específico
function ChildCapacitiesComponent({ parentCode }) {
  const { useCapacitiesByParent } = useCapacities();
  const {
    data: childCapacities,
    isLoading,
    error,
  } = useCapacitiesByParent(parentCode);

  return (
    <div>
      {isLoading ? (
        <p>Carregando subcapacidades...</p>
      ) : (
        <ul>
          {childCapacities?.map((child) => (
            <li key={child.code}>{child.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 3. Busca de Capacidades

Para funcionalidade de busca, use o hook de busca específico:

```tsx
function SearchCapacitiesComponent() {
  const [term, setTerm] = useState("");
  const { useCapacitySearch } = useCapacities();
  const { data: results, isLoading: isSearching } = useCapacitySearch(term);

  return (
    <div>
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Buscar capacidades..."
      />

      {isSearching ? (
        <p>Buscando...</p>
      ) : (
        <ul>
          {results?.map((result) => (
            <li key={result.code}>{result.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 4. Obter Capacidade por ID

Para obter dados de uma capacidade específica pelo ID:

```tsx
function CapacityDetailComponent({ capacityId }) {
  const { useCapacityById } = useCapacities();
  const { data: capacity, isLoading } = useCapacityById(capacityId);

  if (isLoading) return <p>Carregando detalhes...</p>;
  if (!capacity) return <p>Capacidade não encontrada</p>;

  return (
    <div>
      <h2>{capacity.name}</h2>
      <p>Código: {capacity.code}</p>
      {/* Outros detalhes da capacidade */}
    </div>
  );
}
```

### 5. Invalidar o Cache Quando Necessário

Se precisar forçar uma atualização dos dados (por exemplo, após uma atualização ou quando sabe-se que os dados mudaram):

```tsx
import { useQueryClient } from "@tanstack/react-query";
import { CAPACITY_CACHE_KEYS } from "@/hooks/useCapacities";

function AdminPanel() {
  const queryClient = useQueryClient();

  const refreshAllCapacities = () => {
    // Invalida todas as queries relacionadas a capacidades
    queryClient.invalidateQueries({ queryKey: CAPACITY_CACHE_KEYS.all });
  };

  const refreshSpecificParent = (parentCode) => {
    // Invalida apenas as queries para um parent específico
    queryClient.invalidateQueries({
      queryKey: CAPACITY_CACHE_KEYS.byParent(parentCode),
    });
  };

  return (
    <div>
      <button onClick={refreshAllCapacities}>
        Atualizar Todas as Capacidades
      </button>
      <button onClick={() => refreshSpecificParent("106")}>
        Atualizar Capacidades de Tecnologia
      </button>
    </div>
  );
}
```

### 6. Pré-carregamento de Dados

Para melhorar a experiência do usuário, você pode pré-carregar dados que serão necessários em breve:

```tsx
import { useQueryClient } from "@tanstack/react-query";
import { CAPACITY_CACHE_KEYS } from "@/hooks/useCapacities";

function CapacityNavigation() {
  const queryClient = useQueryClient();
  const { rootCapacities } = useCapacities();

  // Função para pré-carregar os dados de um parent ao passar o mouse
  const prefetchParentData = (parentCode) => {
    queryClient.prefetchQuery({
      queryKey: CAPACITY_CACHE_KEYS.byParent(parentCode),
      // Sua função de busca aqui
    });
  };

  return (
    <nav>
      <ul>
        {rootCapacities.map((capacity) => (
          <li
            key={capacity.code}
            onMouseEnter={() => prefetchParentData(capacity.code.toString())}
          >
            <a href={`/capacities/${capacity.code}`}>{capacity.name}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

## Ativando e Usando o React Query DevTools

Para facilitar a depuração e visualização do comportamento de cache, você pode ativar o React Query DevTools. Esta ferramenta permitirá visualizar todas as queries em execução, seus estados, dados e configurações.

### 1. Instalação (caso ainda não esteja instalado)

```bash
npm install @tanstack/react-query-devtools
# ou
yarn add @tanstack/react-query-devtools
```

### 2. Adicionar ao Provider

Modifique o arquivo `src/app/provider.tsx` para incluir o DevTools:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function Providers({ children }) {
  const [queryClient] = useState(new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
}
```

### 3. Usando o DevTools

O DevTools aparecerá como um pequeno botão flutuante no canto inferior direito da aplicação. Clique nele para expandir o painel.

No painel, você verá:

- **Queries**: Todas as queries de React Query em execução
- **Estado**: Estado atual de cada query (fresh, stale, inactive, etc.)
- **Dados**: Os dados atuais armazenados em cache
- **Estatísticas**: Frequência de requisições, hits de cache, etc.

### 4. Verificando o Comportamento de Cache

Para verificar se o cache está funcionando corretamente:

1. Navegue para uma página que carregue capacidades
2. Observe no DevTools as queries sendo executadas
3. Navegue para outra página e volte
4. Você deverá ver que as queries não são executadas novamente (mas podem mostrar "fresh" ou "stale" dependendo do tempo decorrido)

### 5. Testando a Invalidação

Para testar a invalidação manual:

1. Abra o DevTools
2. Execute uma ação que invalide o cache (como clicar em um botão que chama `invalidateQueries`)
3. Observe as queries mudando para o estado "invalid" e sendo reexecutadas

## Melhores Práticas

1. **Use o hook mais específico possível** - Se você só precisa de capacidades raiz, use `rootCapacities` em vez de `useAllCapacities()`

2. **Evite requisições desnecessárias** - Todos os hooks têm uma flag `enabled` que só ativa a requisição quando as dependências estão disponíveis

3. **Aproveite o cache compartilhado** - Componentes diferentes podem usar os mesmos dados sem fazer novas requisições

4. **Configure os tempos de stale/cache conforme a necessidade** - Os tempos padrão são configurados para uso geral, mas você pode ajustá-los para casos específicos

5. **Use o pré-carregamento estrategicamente** - Pré-carregue dados quando for muito provável que o usuário vá precisar deles em seguida

## Exemplo Completo de Componente Otimizado

Consulte o arquivo `capx-frontend/src/components/CapacityExampleUsage.tsx` para um exemplo completo de um componente que utiliza todos os recursos do sistema otimizado.

## Suporte

Se tiver dúvidas durante a migração ou precisar de mais exemplos, entre em contato com a equipe de desenvolvimento.

Para migração de outros hooks relacionados a capacidades, consulte o documento `CAPACITY_HOOKS_MIGRATION.md`.
