"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
  useMemo,
} from "react";
import { useCapacityDescription } from "@/hooks/useCapacitiesQuery";

// Tipos para o contexto
type DescriptionMap = Record<number, string>;
type WdCodeMap = Record<number, string>;

interface CapacityContextType {
  // Obter descrições
  getDescription: (code: number) => string;
  getWdCode: (code: number) => string;

  // Solicitar descrição de forma segura
  requestDescription: (code: number) => Promise<string>;

  // Verificar se descrição já foi solicitada
  isRequested: (code: number) => boolean;

  // Para uso interno
  _addDescription?: (code: number, description: string, wdCode: string) => void;
}

// Componente que busca descrições em segundo plano
const DescriptionFetcher = ({ code }: { code: number }) => {
  const context = useContext(CapacityContext);
  const { data, isSuccess } = useCapacityDescription(code);
  const processedRef = useRef(false);

  React.useEffect(() => {
    // Evitar atualizações durante a desmontagem do componente
    let isMounted = true;

    if (
      isSuccess &&
      data &&
      !processedRef.current &&
      context?._addDescription &&
      isMounted
    ) {
      processedRef.current = true;
      context._addDescription(code, data.description || "", data.wdCode || "");
    }

    return () => {
      isMounted = false;
    };
  }, [isSuccess, data, code, context]);

  return null;
};

// Contexto para descrições
const CapacityContext = createContext<CapacityContextType | null>(null);

// Controlador de estado global para as descrições
const globalDescriptionStore = {
  descriptions: {} as DescriptionMap,
  wdCodes: {} as WdCodeMap,
  requestedCodes: new Set<number>(),
  pendingCodes: new Set<number>(),
  subscribers: new Set<() => void>(),
  isNotifying: false,
  pendingNotification: false,

  // Registrar descrição
  addDescription(code: number, description: string, wdCode: string) {
    // Não atualizar se não houver mudanças
    if (
      this.descriptions[code] === description &&
      this.wdCodes[code] === wdCode
    ) {
      return false;
    }

    this.descriptions[code] = description;
    this.wdCodes[code] = wdCode;
    this.scheduleNotification();
    return true;
  },

  // Solicitar descrição
  requestDescription(code: number): boolean {
    if (this.requestedCodes.has(code)) {
      return false;
    }

    this.requestedCodes.add(code);
    this.pendingCodes.add(code);

    // Use a scheduled notification instead of immediate update
    this.scheduleNotification();
    return true;
  },

  // Obter codigos pendentes e limpar lista
  getPendingAndClear(): number[] {
    const pending = Array.from(this.pendingCodes) as number[];
    this.pendingCodes.clear();
    return pending;
  },

  // Agendar notificação de forma segura (fora do ciclo de renderização)
  scheduleNotification() {
    if (this.isNotifying) {
      this.pendingNotification = true;
      return;
    }

    // Usar setTimeout para garantir que a notificação ocorra fora do ciclo de renderização
    setTimeout(() => {
      this.isNotifying = true;
      this.notifySubscribers();
      this.isNotifying = false;

      // Se houver notificações pendentes, agendar uma nova notificação
      if (this.pendingNotification) {
        this.pendingNotification = false;
        this.scheduleNotification();
      }
    }, 0);
  },

  // Informar mudanças aos componentes inscritos
  notifySubscribers() {
    this.subscribers.forEach((callback) => callback());
  },

  // Inscrever para receber notificações de mudanças
  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  },
};

// Provider do contexto
export function CapacityDescriptionProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Estado local para forçar re-renderização quando o store mudar
  const [, setUpdateCounter] = useState(0);

  // Lista de capacidades a buscar
  const [codesToFetch, setCodeToFetch] = useState<number[]>([]);

  // Inscrever-se para atualizações do store
  React.useEffect(() => {
    const unsubscribe = globalDescriptionStore.subscribe(() => {
      // Forçar re-renderização quando os dados mudarem
      setUpdateCounter((prev) => prev + 1);

      // Buscar novos codigos pendentes
      const pendingCodes = globalDescriptionStore.getPendingAndClear();
      if (pendingCodes.length > 0) {
        setCodeToFetch(pendingCodes);
      }
    });

    return unsubscribe;
  }, []);

  // Adicionar descrição ao cache
  const addDescription = useCallback(
    (code: number, description: string, wdCode: string) => {
      globalDescriptionStore.addDescription(code, description, wdCode);
    },
    []
  );

  // Obter descrição do cache
  const getDescription = useCallback((code: number): string => {
    return globalDescriptionStore.descriptions[code] || "";
  }, []);

  // Obter código WD do cache
  const getWdCode = useCallback((code: number): string => {
    return globalDescriptionStore.wdCodes[code] || "";
  }, []);

  // Solicitar descrição de forma segura
  const requestDescription = useCallback((code: number): Promise<string> => {
    const description = globalDescriptionStore.descriptions[code];

    // Se já solicitamos, apenas retornar o valor atual
    if (!globalDescriptionStore.requestDescription(code)) {
      return Promise.resolve(description || "");
    }

    // Aqui retornamos a promessa, mas a busca será feita pelo DescriptionFetcher
    return Promise.resolve(description || "");
  }, []);

  // Verificar se descrição já foi solicitada
  const isRequested = useCallback((code: number): boolean => {
    return globalDescriptionStore.requestedCodes.has(code);
  }, []);

  // Memoize contextValue para evitar re-renders desnecessários
  const contextValue = useMemo(() => {
    return {
      getDescription,
      getWdCode,
      requestDescription,
      isRequested,
      _addDescription: addDescription,
    };
  }, [
    getDescription,
    getWdCode,
    requestDescription,
    isRequested,
    addDescription,
  ]);

  return (
    <CapacityContext.Provider value={contextValue}>
      {/* Componentes que buscam descrições em segundo plano */}
      {codesToFetch.map((code) => (
        <DescriptionFetcher key={`desc-${code}`} code={code} />
      ))}

      {children}
    </CapacityContext.Provider>
  );
}

// Hook para usar o contexto
export function useCapacityDescriptions() {
  const context = useContext(CapacityContext);

  if (!context) {
    throw new Error(
      "useCapacityDescriptions deve ser usado dentro de um CapacityDescriptionProvider"
    );
  }

  return context;
}
