# Guia de Migração dos Hooks de Capacidades

Este documento complementa o `CAPACITIES_OPTIMIZATION_GUIDE.md` e fornece informações detalhadas sobre como migrar componentes que usam os hooks de capacidades (`useCapacityDetails`, `useCapacityProfile`, `useCapacity`) para as novas versões otimizadas.

## Resumo das Mudanças

Todos os hooks relacionados a capacidades foram refatorados para usar o React Query, o que traz os seguintes benefícios:

1. **Cache compartilhado entre componentes**: Reduz requisições redundantes
2. **Reaproveitamento de dados**: Mesmo quando o componente é montado várias vezes
3. **Controle de tempo de expiração**: Cache configurado com `staleTime` e `gcTime`
4. **Dependência automática de parâmetros**: Reage a mudanças de parâmetros como `language`
5. **Integração com o cache global**: Utiliza o mesmo sistema de cache que `useCapacities`

## Como Migrar os Componentes

### De `useCapacityDetails` Antigo para o Novo

O hook `useCapacityDetails` agora usa internamente o React Query para buscar e gerenciar os dados das capacidades.

#### Antes:

```tsx
function MyComponent({ capacitiesIds }) {
  const { capacityNames } = useCapacityDetails(capacitiesIds);

  return (
    <div>
      {capacitiesIds.map((id) => (
        <span key={id}>{capacityNames[id]}</span>
      ))}
    </div>
  );
}
```

#### Depois:

```tsx
function MyComponent({ capacitiesIds }) {
  // O hook agora retorna também a função getCapacityName que é mais segura para usar
  const { capacityNames, getCapacityName } = useCapacityDetails(capacitiesIds);

  return (
    <div>
      {capacitiesIds.map((id) => (
        <span key={id}>{getCapacityName(id)}</span>
      ))}
    </div>
  );
}
```

### De `useCapacityProfile` Antigo para o Novo

O hook `useCapacityProfile` foi refatorado para usar React Query e não precisa mais de chamadas manuais a `refreshCapacityData` quando o idioma muda.

#### Antes:

```tsx
function CapacityView({ capacityId }) {
  const { pageContent, language } = useApp();
  const { selectedCapacityData, refreshCapacityData, isLoading } =
    useCapacityProfile(capacityId);

  // Era necessário atualizar manualmente quando a linguagem mudava
  useEffect(() => {
    refreshCapacityData(language);
  }, [language, refreshCapacityData]);

  // Resto do componente...
}
```

#### Depois:

```tsx
function CapacityView({ capacityId }) {
  const { pageContent, language } = useApp();

  // Agora você pode passar o idioma diretamente ao hook
  const { selectedCapacityData, isLoading } = useCapacityProfile(
    capacityId,
    language
  );

  // Não é mais necessário o useEffect para atualizar o idioma
  // Isso é gerenciado automaticamente pelo React Query via queryKey

  // Resto do componente...
}
```

### De `useCapacity` Antigo para o Novo

O hook `useCapacity` também foi refatorado para usar React Query:

#### Antes:

```tsx
function CapacityDetail({ capacityId }) {
  const { capacity, isLoading, error } = useCapacity(capacityId);

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error.message}</p>;

  return <div>{capacity?.name}</div>;
}
```

#### Depois:

A API permanece a mesma, mas agora o hook aproveita o cache do React Query:

```tsx
function CapacityDetail({ capacityId }) {
  const { capacity, isLoading, error } = useCapacity(capacityId);

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error.message}</p>;

  return <div>{capacity?.name}</div>;
}
```

## Verificando a Otimização

Existem algumas maneiras de verificar se a otimização está funcionando:

1. **Inspecione as requisições de rede**: Abra as ferramentas de desenvolvedor (F12) e vá para a aba Network. Navegue pelo aplicativo e observe que, ao retornar para uma tela com capacidades já carregadas, não são feitas novas requisições.

2. **Teste desconectado**: Carregue a aplicação, navegue para ver algumas capacidades, e depois desconecte a internet. As capacidades já carregadas continuarão disponíveis.

3. **Verifique o React Query Devtools**: Se o React Query Devtools estiver habilitado, você pode ver todas as queries em cache e seus estados.

## Diagnosticando Problemas Comuns

### Componentes que ainda fazem requisições redundantes

Se você notar que algum componente ainda está fazendo requisições redundantes:

1. Verifique se está usando a versão mais recente do hook
2. Certifique-se de que as `queryKey` estão consistentes
3. Verifique se não há invalidação acidental do cache em algum lugar

### Dados incorretos ou desatualizados

Se os dados parecem desatualizados:

1. Você pode usar `queryClient.invalidateQueries()` para força a atualização
2. Verifique os tempos de `staleTime` configurados nos hooks
3. Considere reduzir o tempo de `staleTime` para dados que mudam com frequência

## Pontos de Atenção para Migração

1. **Hook retorna funções diferentes**: Algumas funções de callback (como `refreshCapacityData`) possuem assinaturas diferentes

2. **Estados de carregamento**: Os estados de carregamento podem ter comportamento ligeiramente diferente quando as consultas são reexecutadas em segundo plano

3. **Dependencies de useEffect**: Remova useEffects desnecessários que lidavam com a atualização manual de dados

4. **Typescript**: Alguns tipos podem precisar ser ajustados para corresponder às novas implementações

## Suporte

Se encontrar problemas durante a migração, consulte:

- O guia completo de refatoração em `CAPACITIES_OPTIMIZATION_GUIDE.md`
- O exemplo de uso em `src/components/CapacityExampleUsage.tsx`
