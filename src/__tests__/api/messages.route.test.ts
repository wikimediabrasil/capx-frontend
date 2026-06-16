jest.mock('axios');

import axios from 'axios';
import { GET, POST } from '@/app/api/messages/route';
import { setupApiTest, testGetRoute, testMutationRoute } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;

describe('/api/messages', () => {
  beforeEach(() => setupApiTest());

  testGetRoute({
    mockAxios: mockAxiosGet,
    handler: GET,
    path: '/api/messages',
    axiosData: { results: [{ id: 1 }] },
    expected: [{ id: 1 }],
    errorMsg: 'Failed to fetch message',
  });

  describe('POST', () => {
    testMutationRoute({
      mockAxios: mockAxiosPost,
      handler: POST,
      path: '/api/messages',
      body: { content: 'Hello' },
      axiosData: { id: 1 },
      expected: { id: 1 },
      label: 'creates a message',
    });
  });
});
