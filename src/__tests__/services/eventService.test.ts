import axios from 'axios';
import { eventsService } from '@/services/eventService';
import { EventLocationType } from '@/app/events/types';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('eventsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEvents', () => {
    it('should fetch events with pagination', async () => {
      const mockData = { results: [{ id: 1 }], count: 1 };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await eventsService.getEvents(10, 0);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/events/', {
        params: { limit: 10, offset: 0 },
      });
      expect(result).toEqual(mockData);
    });

    it('should handle array response format', async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockData, headers: {} });

      const result = await eventsService.getEvents();
      expect(result.results).toEqual(mockData);
      expect(result.count).toBe(2);
    });

    it('should throw on error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Failed'));
      await expect(eventsService.getEvents()).rejects.toThrow('Failed');
    });
  });

  describe('getEventById', () => {
    it('should fetch event by id', async () => {
      const mockData = { id: 1, name: 'Event', organization: 1 };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await eventsService.getEventById(1, 'test-token');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/events/1', {
        headers: { Authorization: 'Token test-token' },
      });
      expect(result).toEqual(mockData);
    });

    it('should throw on empty response', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: null });
      await expect(eventsService.getEventById(1, 'token')).rejects.toThrow();
    });
  });

  describe('createEvent', () => {
    it('should create an event with defaults', async () => {
      const mockData = { id: 1, name: 'New Event' };
      mockedAxios.post.mockResolvedValueOnce({ data: mockData });

      const result = await eventsService.createEvent({ name: 'New Event' }, 'test-token');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/events/',
        { name: 'New Event', type_of_location: 'virtual' },
        { headers: { Authorization: 'Token test-token' } }
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('updateEvent', () => {
    it('should update an event', async () => {
      const mockData = { id: 1, name: 'Updated' };
      mockedAxios.put.mockResolvedValueOnce({ data: mockData });

      const result = await eventsService.updateEvent(1, { name: 'Updated' }, 'test-token');
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/events/1/',
        { name: 'Updated' },
        { headers: { Authorization: 'Token test-token' } }
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      mockedAxios.delete.mockResolvedValueOnce({});
      await eventsService.deleteEvent(1, 'test-token');
      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/events/1/', {
        headers: { Authorization: 'Token test-token' },
      });
    });

    it('should throw on delete error', async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error('Delete failed'));
      await expect(eventsService.deleteEvent(1, 'test-token')).rejects.toThrow('Delete failed');
    });
  });

  describe('getEvents with filters', () => {
    it('should apply capacities filter', async () => {
      const mockData = { results: [], count: 0 };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      await eventsService.getEvents(10, 0, {
        capacities: [{ code: 5 }, { code: 10 }] as any,
      } as any);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/events/', {
        params: expect.objectContaining({ related_skills: '5,10' }),
      });
    });

    it('should apply territories filter', async () => {
      const mockData = { results: [], count: 0 };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      await eventsService.getEvents(10, 0, {
        territories: ['CEECA', 'LAC'],
      } as any);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/events/', {
        params: expect.objectContaining({ territories: 'CEECA,LAC' }),
      });
    });

    it('should apply in_person location type filter', async () => {
      const mockData = { results: [], count: 0 };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      await eventsService.getEvents(10, 0, {
        locationType: EventLocationType.InPerson,
      } as any);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/events/', {
        params: expect.objectContaining({ type_of_location: 'in_person' }),
      });
    });

    it('should apply hybrid location type filter', async () => {
      const mockData = { results: [], count: 0 };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      await eventsService.getEvents(10, 0, {
        locationType: EventLocationType.Hybrid,
      } as any);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/events/', {
        params: expect.objectContaining({ type_of_location: 'hybrid' }),
      });
    });

    it('should apply online location type filter', async () => {
      const mockData = { results: [], count: 0 };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      await eventsService.getEvents(10, 0, {
        locationType: EventLocationType.Online,
      } as any);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/events/', {
        params: expect.objectContaining({ type_of_location: 'virtual' }),
      });
    });

    it('should not apply location type filter when All', async () => {
      const mockData = { results: [], count: 0 };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      await eventsService.getEvents(10, 0, {
        locationType: EventLocationType.All,
      } as any);

      const callParams = mockedAxios.get.mock.calls[0][1].params;
      expect(callParams).not.toHaveProperty('type_of_location');
    });

    it('should apply date range filters', async () => {
      const mockData = { results: [], count: 0 };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      await eventsService.getEvents(10, 0, {
        dateRange: { startDate: '2025-01-01', endDate: '2025-12-31' },
      } as any);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/events/', {
        params: expect.objectContaining({
          start_date: '2025-01-01',
          end_date: '2025-12-31',
        }),
      });
    });

    it('should apply organization filter', async () => {
      const mockData = { results: [], count: 0 };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      await eventsService.getEvents(10, 0, {
        organizationId: 42,
      } as any);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/events/', {
        params: expect.objectContaining({ organization_id: 42 }),
      });
    });

    it('should use x-total-count header when present in array response', async () => {
      const mockData = [{ id: 1 }];
      mockedAxios.get.mockResolvedValueOnce({
        data: mockData,
        headers: { 'x-total-count': '100' },
      });

      const result = await eventsService.getEvents();
      expect(result.count).toBe(100);
    });
  });

  describe('getEventById edge cases', () => {
    it('should warn but continue when event has no id field', async () => {
      const mockData = { name: 'Event without id', organization: 1 };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await eventsService.getEventById(1, 'token');
      expect(result).toEqual(mockData);
    });

    it('should warn but continue when organization is null', async () => {
      const mockData = { id: 1, name: 'Event', organization: null };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await eventsService.getEventById(1, 'token');
      expect(result).toEqual(mockData);
    });

    it('should throw with response details when API returns error response', async () => {
      const axiosError = {
        message: 'Request failed',
        response: { status: 404, data: { detail: 'Not found' } },
      };
      mockedAxios.get.mockRejectedValueOnce(axiosError);

      await expect(eventsService.getEventById(99, 'token')).rejects.toMatchObject({
        response: { status: 404 },
      });
    });
  });

  describe('createEvent', () => {
    it('should use provided type_of_location instead of default', async () => {
      const mockData = { id: 1, name: 'New Event', type_of_location: 'in_person' };
      mockedAxios.post.mockResolvedValueOnce({ data: mockData });

      await eventsService.createEvent(
        { name: 'New Event', type_of_location: 'in_person' },
        'token'
      );
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/events/',
        { name: 'New Event', type_of_location: 'in_person' },
        expect.any(Object)
      );
    });

    it('should throw on create error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Create failed'));
      await expect(eventsService.createEvent({ name: 'New Event' }, 'token')).rejects.toThrow(
        'Create failed'
      );
    });
  });
});
