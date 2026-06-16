import axios from 'axios';
import { BugReportService } from '@/services/bugReportService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('BugReportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitReport', () => {
    it('should submit a bug report', async () => {
      const mockResponse = { data: { id: 1, title: 'Bug' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await BugReportService.submitReport({
        bugReport: { title: 'Bug', description: 'Desc', bug_type: 'ui' },
        token: 'test-token',
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/report',
        { title: 'Bug', description: 'Desc', bug_type: 'ui' },
        {
          headers: {
            Authorization: 'Token test-token',
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw on error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Failed'));
      await expect(
        BugReportService.submitReport({ bugReport: {}, token: 'token' })
      ).rejects.toThrow('Failed');
    });
  });

  describe('getReports', () => {
    it('should fetch reports', async () => {
      const mockData = [{ id: 1, title: 'Bug' }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await BugReportService.getReports('test-token');
      expect(result).toEqual(mockData);
    });
  });

  describe('getReportById', () => {
    it('should fetch report by id', async () => {
      const mockData = { id: 1, title: 'Bug' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await BugReportService.getReportById('1', 'test-token');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/report?reportId=1', expect.any(Object));
      expect(result).toEqual(mockData);
    });
  });
});
