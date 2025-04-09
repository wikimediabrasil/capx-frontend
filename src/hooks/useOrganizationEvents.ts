import { useState, useEffect, useCallback } from "react";
import { Event } from "@/types/event";
import { eventsService } from "@/services/eventService";

export function useOrganizationEvents(
  organizationId: number | string,
  token?: string
) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const organizationIdNum = Number(organizationId);

  // Carregar eventos da organização
  const fetchOrganizationEvents = useCallback(async () => {
    if (!token || !organizationId) return [];

    setIsLoading(true);
    try {
      // Busca todos os eventos
      const allEvents = await eventsService.getEvents(token);

      // Filtra apenas os eventos relacionados a esta organização
      const organizationEvents = allEvents.filter(
        (event) =>
          event.organizations && event.organizations.includes(organizationIdNum)
      );

      setEvents(organizationEvents);
      setError(null);
      return organizationEvents;
    } catch (err) {
      const errorMessage = "Falha ao carregar eventos da organização";
      setError(err instanceof Error ? err : new Error(errorMessage));
      console.error(errorMessage, err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [token, organizationId, organizationIdNum]);

  // Carregar eventos por IDs específicos
  const fetchEventsByIds = useCallback(
    async (eventIds: number[]) => {
      if (!token || !eventIds.length) return [];

      setIsLoading(true);
      try {
        const eventPromises = eventIds.map((id) =>
          eventsService.getEventById(id, token)
        );

        const results = await Promise.allSettled(eventPromises);

        const loadedEvents = results
          .filter(
            (result): result is PromiseFulfilledResult<Event> =>
              result.status === "fulfilled"
          )
          .map((result) => result.value)
          // Validar se o evento pertence à organização
          .filter(
            (event) =>
              event.organizations &&
              event.organizations.includes(organizationIdNum)
          );

        setEvents(loadedEvents);
        return loadedEvents;
      } catch (err) {
        const errorMessage = "Falha ao carregar eventos por IDs";
        setError(err instanceof Error ? err : new Error(errorMessage));
        console.error(errorMessage, err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [token, organizationIdNum]
  );

  // Criar um novo evento para a organização
  const createEvent = useCallback(
    async (eventData: Partial<Event>) => {
      if (!token) {
        throw new Error("Token não disponível para criar evento");
      }

      setIsLoading(true);
      try {
        console.log(
          "useOrganizationEvents - Dados iniciais do evento:",
          eventData
        );

        // Verificar se o organizations já é um array, se não for, inicializar
        let organizations = Array.isArray(eventData.organizations)
          ? [...eventData.organizations]
          : [];

        // Garantir que a organização atual esteja incluída no array
        if (!organizations.includes(organizationIdNum)) {
          organizations.push(organizationIdNum);
        }

        // Garantir que a organização esteja nos dados do evento
        const preparedData = {
          ...eventData,
          organizations, // Array já processado
          organization: organizationIdNum, // Campo individual também é mantido para compatibilidade
        };

        console.log("useOrganizationEvents - Dados processados do evento:", {
          organizationIdNum,
          organizations,
          prepared: preparedData,
        });

        const createdEvent = await eventsService.createEvent(
          preparedData,
          token
        );

        console.log("useOrganizationEvents - Evento criado:", createdEvent);

        // Verificar se o evento foi criado corretamente com a organização
        if (
          !createdEvent.organizations ||
          !createdEvent.organizations.includes(organizationIdNum)
        ) {
          console.warn(
            "AVISO: O evento foi criado, mas sem a organização no campo 'organizations'",
            {
              eventId: createdEvent.id,
              organizationId: organizationIdNum,
              organizations: createdEvent.organizations,
            }
          );
        }

        // Atualizar a lista de eventos
        setEvents((prevEvents) => [...prevEvents, createdEvent]);

        return createdEvent;
      } catch (err) {
        const errorMessage = "Falha ao criar evento";
        setError(err instanceof Error ? err : new Error(errorMessage));
        console.error(errorMessage, err);
        // Log detalhado do erro
        if (err.response) {
          console.error("Detalhes do erro da API:", {
            status: err.response.status,
            data: err.response.data,
          });
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [token, organizationIdNum]
  );

  // Atualizar um evento existente
  const updateEvent = useCallback(
    async (eventId: number, eventData: Partial<Event>) => {
      if (!token) {
        throw new Error("Token não disponível para atualizar evento");
      }

      setIsLoading(true);
      try {
        console.log("useOrganizationEvents - Atualizando evento:", {
          eventId,
          data: eventData,
        });

        // Verificar se o organizations já é um array, se não for, inicializar
        let organizations = Array.isArray(eventData.organizations)
          ? [...eventData.organizations]
          : [];

        // Garantir que a organização atual esteja incluída no array
        if (!organizations.includes(organizationIdNum)) {
          organizations.push(organizationIdNum);
        }

        // Preparar dados com organização garantida
        const preparedData = {
          ...eventData,
          organizations, // Array já processado
          organization: organizationIdNum, // Campo individual também é mantido para compatibilidade
        };

        console.log(
          "useOrganizationEvents - Dados processados para atualização:",
          {
            organizationIdNum,
            organizations,
            prepared: preparedData,
          }
        );

        const updatedEvent = await eventsService.updateEvent(
          eventId,
          preparedData,
          token
        );

        console.log("useOrganizationEvents - Evento atualizado:", updatedEvent);

        // Verificar se o evento foi atualizado corretamente com a organização
        if (
          !updatedEvent.organizations ||
          !updatedEvent.organizations.includes(organizationIdNum)
        ) {
          console.warn(
            "AVISO: O evento foi atualizado, mas sem a organização no campo 'organizations'",
            {
              eventId: updatedEvent.id,
              organizationId: organizationIdNum,
              organizations: updatedEvent.organizations,
            }
          );
        }

        // Atualizar a lista de eventos
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === eventId ? updatedEvent : event
          )
        );

        return updatedEvent;
      } catch (err) {
        const errorMessage = "Falha ao atualizar evento";
        setError(err instanceof Error ? err : new Error(errorMessage));
        console.error(errorMessage, err);
        // Log detalhado do erro
        if (err.response) {
          console.error("Detalhes do erro da API:", {
            status: err.response.status,
            data: err.response.data,
          });
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [token, organizationIdNum]
  );

  // Deletar um evento
  const deleteEvent = useCallback(
    async (eventId: number) => {
      if (!token) {
        throw new Error("Token não disponível para deletar evento");
      }

      setIsLoading(true);
      try {
        await eventsService.deleteEvent(eventId, token);

        // Remover o evento da lista
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== eventId)
        );

        return true;
      } catch (err) {
        const errorMessage = "Falha ao deletar evento";
        setError(err instanceof Error ? err : new Error(errorMessage));
        console.error(errorMessage, err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  // Carregar eventos automaticamente ao inicializar
  useEffect(() => {
    fetchOrganizationEvents();
  }, [fetchOrganizationEvents]);

  return {
    events,
    isLoading,
    error,
    fetchOrganizationEvents,
    fetchEventsByIds,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
