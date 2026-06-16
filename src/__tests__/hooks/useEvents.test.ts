import { renderHook, act, waitFor } from '@testing-library/react';
import { useEvent, useEvents } from '@/hooks/useEvents';

jest.mock('@/services/eventService', () => ({
  eventsService: {
    getEventById: jest.fn(),
    getEvents: jest.fn(),
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
  },
}));

import { eventsService } from '@/services/eventService';

const mockEventsService = eventsService as jest.Mocked<typeof eventsService>;

const mockEvent = {
  id: 1,
  name: 'Test Event',
  type_of_location: 'virtual',
  time_begin: '2024-01-01T00:00:00Z',
  organization: 1,
};

describe('useEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has correct initial state', () => {
    const { result } = renderHook(() => useEvent());

    expect(result.current.event).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches event when eventId and token are provided', async () => {
    mockEventsService.getEventById.mockResolvedValue(mockEvent as any);

    const { result } = renderHook(() => useEvent(1, 'test-token'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockEventsService.getEventById).toHaveBeenCalledWith(1, 'test-token');
    expect(result.current.event).toEqual(mockEvent);
    expect(result.current.error).toBeNull();
  });

  it('does not fetch when no token', async () => {
    renderHook(() => useEvent(1, undefined));

    await waitFor(() => {
      expect(mockEventsService.getEventById).not.toHaveBeenCalled();
    });
  });

  it('does not fetch when no eventId', async () => {
    renderHook(() => useEvent(undefined, 'test-token'));

    await waitFor(() => {
      expect(mockEventsService.getEventById).not.toHaveBeenCalled();
    });
  });

  it('sets error when getEventById fails', async () => {
    mockEventsService.getEventById.mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useEvent(1, 'test-token'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toEqual(new Error('Not found'));
    expect(result.current.event).toBeNull();
  });

  it('createEvent creates an event successfully', async () => {
    mockEventsService.createEvent.mockResolvedValue(mockEvent as any);

    const { result } = renderHook(() => useEvent(undefined, 'test-token'));

    let response: any;
    await act(async () => {
      response = await result.current.createEvent({ name: 'New Event', organization: 1, time_begin: '2024-01-01T00:00:00Z', type_of_location: 'virtual' });
    });

    expect(mockEventsService.createEvent).toHaveBeenCalled();
    expect(response).toEqual(mockEvent);
    expect(result.current.event).toEqual(mockEvent);
  });

  it('createEvent does nothing when no token', async () => {
    const { result } = renderHook(() => useEvent());

    await act(async () => {
      await result.current.createEvent({ name: 'New Event' });
    });

    expect(mockEventsService.createEvent).not.toHaveBeenCalled();
  });

  it('createEvent throws when API returns invalid response', async () => {
    mockEventsService.createEvent.mockResolvedValue({ id: undefined } as any);

    const { result } = renderHook(() => useEvent(undefined, 'test-token'));

    await expect(
      act(async () => {
        await result.current.createEvent({ name: 'New Event' });
      })
    ).rejects.toThrow('Invalid event response from server');
  });

  it('updateEvent updates an event successfully', async () => {
    const updatedEvent = { ...mockEvent, name: 'Updated Event' };
    mockEventsService.updateEvent.mockResolvedValue(updatedEvent as any);

    const { result } = renderHook(() => useEvent(undefined, 'test-token'));

    let response: any;
    await act(async () => {
      response = await result.current.updateEvent(1, { name: 'Updated Event' });
    });

    expect(mockEventsService.updateEvent).toHaveBeenCalledWith(1, { name: 'Updated Event' }, 'test-token');
    expect(response).toEqual(updatedEvent);
  });

  it('updateEvent does nothing when no token', async () => {
    const { result } = renderHook(() => useEvent());

    await act(async () => {
      await result.current.updateEvent(1, { name: 'Updated Event' });
    });

    expect(mockEventsService.updateEvent).not.toHaveBeenCalled();
  });

  it('deleteEvent deletes an event and clears state', async () => {
    mockEventsService.getEventById.mockResolvedValue(mockEvent as any);
    mockEventsService.deleteEvent.mockResolvedValue(undefined);

    const { result } = renderHook(() => useEvent(1, 'test-token'));

    await waitFor(() => expect(result.current.event).toEqual(mockEvent));

    await act(async () => {
      await result.current.deleteEvent(1);
    });

    expect(mockEventsService.deleteEvent).toHaveBeenCalledWith(1, 'test-token');
    expect(result.current.event).toBeNull();
  });

  it('deleteEvent sets error on failure', async () => {
    mockEventsService.deleteEvent.mockRejectedValue(new Error('Delete failed'));

    const { result } = renderHook(() => useEvent(undefined, 'test-token'));

    await act(async () => {
      await result.current.deleteEvent(1);
    });

    expect(result.current.error).toEqual(new Error('Delete failed'));
  });
});

describe('useEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has correct initial state', () => {
    mockEventsService.getEvents.mockResolvedValue({ results: [], count: 0 } as any);

    const { result } = renderHook(() => useEvents());

    expect(result.current.events).toEqual([]);
    expect(result.current.count).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('fetches events on mount', async () => {
    const mockEvents = [mockEvent];
    mockEventsService.getEvents.mockResolvedValue({ results: mockEvents, count: 1 } as any);

    const { result } = renderHook(() => useEvents('test-token'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.events).toEqual(mockEvents);
    expect(result.current.count).toBe(1);
  });

  it('handles array response format', async () => {
    const mockEvents = [mockEvent];
    mockEventsService.getEvents.mockResolvedValue(mockEvents as any);

    const { result } = renderHook(() => useEvents('test-token'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.events).toEqual(mockEvents);
  });

  it('sets error on fetch failure', async () => {
    mockEventsService.getEvents.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useEvents('test-token'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toEqual(new Error('Network error'));
    expect(result.current.events).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('filters events by locationType when filter is set', async () => {
    const events = [
      { ...mockEvent, id: 1, type_of_location: 'virtual' },
      { ...mockEvent, id: 2, type_of_location: 'in_person' },
    ];
    mockEventsService.getEvents.mockResolvedValue({ results: events, count: 2 } as any);

    const { result } = renderHook(() =>
      useEvents('test-token', undefined, undefined, undefined, {
        locationType: 'online' as any,
        capacities: [],
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.events.every(e => e.type_of_location === 'virtual')).toBe(true);
  });

  it('fetchEventsByIds returns empty array when no token', async () => {
    mockEventsService.getEvents.mockResolvedValue({ results: [], count: 0 } as any);

    const { result } = renderHook(() => useEvents());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let events: any[];
    await act(async () => {
      events = await result.current.fetchEventsByIds([1, 2]);
    });

    expect(events!).toEqual([]);
  });

  it('fetchEventsByIds returns empty array when no ids', async () => {
    mockEventsService.getEvents.mockResolvedValue({ results: [], count: 0 } as any);

    const { result } = renderHook(() => useEvents('test-token'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let events: any[];
    await act(async () => {
      events = await result.current.fetchEventsByIds([]);
    });

    expect(events!).toEqual([]);
  });

  it('fetchEventsByIds fetches events by IDs', async () => {
    mockEventsService.getEvents.mockResolvedValue({ results: [], count: 0 } as any);
    mockEventsService.getEventById.mockResolvedValue(mockEvent as any);

    const { result } = renderHook(() => useEvents('test-token'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let events: any[];
    await act(async () => {
      events = await result.current.fetchEventsByIds([1]);
    });

    expect(mockEventsService.getEventById).toHaveBeenCalledWith(1, 'test-token');
    expect(events!).toEqual([mockEvent]);
  });
});
