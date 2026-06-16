jest.mock('axios');
import axios from 'axios';
import { setupApiTest, testGetRoute } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;

const mentorshipRoutes = [
  { name: 'mentorship_form_mentor', label: 'mentor forms' },
  { name: 'mentorship_form_mentee', label: 'mentee forms' },
  { name: 'mentorship_availability', label: 'availability' },
];

describe('Mentorship API routes', () => {
  beforeEach(() => setupApiTest());

  mentorshipRoutes.forEach(({ name }) => {
    describe(`/api/${name}`, () => {
      testGetRoute({
        mockAxios: mockAxiosGet,
        handler: (...args: any[]) => require(`@/app/api/${name}/route`).GET(...args),
        path: `/api/${name}`,
        axiosData: [{ id: 1 }],
        expected: [{ id: 1 }],
        errorMsg: expect.stringContaining('Failed') as any,
        errorPayload: { message: 'fail', response: { status: 500 } },
        noRequest: true,
      });
    });
  });
});
