jest.mock('axios');

import axios from 'axios';
import { GET, POST } from '@/app/api/projects/route';
import { NextResponse } from 'next/server';
import { createAuthenticatedRequest, setupApiTest, testGetRoute, testMutationRoute } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;

describe('/api/projects', () => {
  beforeEach(() => setupApiTest());

  testGetRoute({
    mockAxios: mockAxiosGet,
    handler: GET,
    path: '/api/projects',
    axiosData: { results: [{ id: 1 }] },
    expected: [{ id: 1 }],
    errorMsg: 'Failed to fetch projects',
    errorPayload: { message: 'fail' },
  });

  describe('POST', () => {
    testMutationRoute({
      mockAxios: mockAxiosPost,
      handler: POST,
      path: '/api/projects',
      body: { display_name: 'New' },
      axiosData: { id: 1, display_name: 'New' },
      expected: { id: 1, display_name: 'New' },
      label: 'creates a project',
    });

    it('returns error for invalid response', async () => {
      mockAxiosPost.mockResolvedValue({ data: {} });
      await POST(createAuthenticatedRequest('/api/projects', { body: { display_name: 'Bad' } }));
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 500 }),
        expect.objectContaining({ status: 500 })
      );
    });
  });
});
