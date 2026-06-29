jest.mock('axios');

import axios from 'axios';
import { GET, POST, OPTIONS } from '@/app/api/report/route';
import { NextResponse } from 'next/server';
import {
  createAuthenticatedRequest,
  setupApiTest,
  testGetRoute,
  testMutationRoute,
} from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;
const mockAxiosOptions = axios.options as jest.Mock;

describe('/api/report', () => {
  beforeEach(() => setupApiTest());

  testGetRoute({
    mockAxios: mockAxiosGet,
    handler: GET,
    path: '/api/report',
    axiosData: { results: [{ id: 1 }] },
    expected: [{ id: 1 }],
    errorMsg: 'Failed to fetch report',
  });

  describe('POST', () => {
    testMutationRoute({
      mockAxios: mockAxiosPost,
      handler: POST,
      path: '/api/report',
      body: { title: 'Bug' },
      axiosData: { id: 1 },
      expected: { id: 1 },
      label: 'creates a report',
    });
  });

  describe('OPTIONS', () => {
    it('returns form fields', async () => {
      mockAxiosOptions.mockResolvedValue({ data: { actions: { PUT: { user: {}, title: {} } } } });
      await OPTIONS(
        createAuthenticatedRequest('/api/report', {
          url: 'https://localhost:3000/api/report?reportId=1',
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith({ title: {} });
    });
  });
});
