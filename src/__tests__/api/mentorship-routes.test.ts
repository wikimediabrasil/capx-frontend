jest.mock('axios');
import axios from 'axios';
import { setupApiTest, testGetRoute } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;

describe('Mentorship API routes', () => {
  beforeEach(() => setupApiTest());

  describe('/api/mentorship_form_mentor', () => {
    testGetRoute({
      mockAxios: mockAxiosGet,
      handler: (...args: any[]) => require('@/app/api/mentorship_form_mentor/route').GET(...args),
      path: '/api/mentorship_form_mentor',
      axiosData: [{ id: 1 }],
      expected: [{ id: 1 }],
      errorMsg: expect.stringContaining('Failed') as any,
      errorPayload: { message: 'fail', response: { status: 500 } },
      noRequest: true,
    });
  });

  describe('/api/mentorship_form_mentee', () => {
    testGetRoute({
      mockAxios: mockAxiosGet,
      handler: (...args: any[]) => require('@/app/api/mentorship_form_mentee/route').GET(...args),
      path: '/api/mentorship_form_mentee',
      axiosData: [{ id: 1 }],
      expected: [{ id: 1 }],
      errorMsg: expect.stringContaining('Failed') as any,
      errorPayload: { message: 'fail', response: { status: 500 } },
      noRequest: true,
    });
  });

  describe('/api/mentorship_availability', () => {
    testGetRoute({
      mockAxios: mockAxiosGet,
      handler: (...args: any[]) => require('@/app/api/mentorship_availability/route').GET(...args),
      path: '/api/mentorship_availability',
      axiosData: [{ id: 1 }],
      expected: [{ id: 1 }],
      errorMsg: expect.stringContaining('Failed') as any,
      errorPayload: { message: 'fail', response: { status: 500 } },
      noRequest: true,
    });
  });
});
