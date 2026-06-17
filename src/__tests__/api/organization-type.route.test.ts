jest.mock('axios');
import axios from 'axios';
import { GET } from '@/app/api/organization_type/route';
import { setupApiTest, testGetRoute } from '../helpers/apiTestHelpers';
const mockAxiosGet = axios.get as jest.Mock;
describe('GET /api/organization_type', () => {
  beforeEach(() => setupApiTest());
  testGetRoute({
    mockAxios: mockAxiosGet,
    handler: GET,
    path: '/api/organization_type',
    axiosData: { results: [{ id: 1 }] },
    expected: [{ id: 1 }],
    errorMsg: expect.stringContaining('Failed'),
    errorPayload: { message: 'fail' },
  });
});
