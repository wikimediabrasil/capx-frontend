jest.mock('axios');

import axios from 'axios';
import { GET, PUT } from '@/app/api/user_badge/route';
import { setupApiTest, testGetRoute, testMutationRoute } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPut = axios.put as jest.Mock;

describe('/api/user_badge', () => {
  beforeEach(() => setupApiTest());

  testGetRoute({
    mockAxios: mockAxiosGet,
    handler: GET,
    path: '/api/user_badge',
    axiosData: [{ id: 1 }],
    expected: [{ id: 1 }],
    errorMsg: 'Failed to fetch user badges',
  });

  describe('PUT', () => {
    testMutationRoute({
      mockAxios: mockAxiosPut,
      handler: PUT,
      path: '/api/user_badge',
      body: { id: 1, badge: 'updated' },
      axiosData: { id: 1, badge: 'updated' },
      expected: { id: 1, badge: 'updated' },
      label: 'updates user badge',
    });
  });
});
