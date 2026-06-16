jest.mock('axios');
import axios from 'axios';
import { GET } from '@/app/api/wikimedia_project/route';
import { setupApiTest, testGetRoute } from '../helpers/apiTestHelpers';
const mockAxiosGet = axios.get as jest.Mock;
describe('GET /api/wikimedia_project', () => {
  beforeEach(() => setupApiTest());
  testGetRoute({
    mockAxios: mockAxiosGet,
    handler: GET,
    path: '/api/wikimedia_project',
    axiosData: { results: [{ id: 1 }] },
    expected: [{ id: 1 }],
    errorMsg: 'Failed to fetch projects',
  });
});
