import { DELETE } from '@/app/api/profile/route';
import axios from 'axios';
import { createMockRequest } from '../test-utils';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DELETE /api/profile', () => {
  const mockUserId = 123;
  const mockToken = 'test-token-123';
  const mockBaseUrl = 'http://localhost:8000';

  beforeAll(() => {
    process.env.BASE_URL = mockBaseUrl;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully delete profile with status 200', async () => {
    mockedAxios.delete.mockResolvedValue({
      status: 200,
      data: { success: true },
    });

    const mockRequest = createMockRequest({ userId: mockUserId, token: mockToken });
    const response = await DELETE(mockRequest);
    const responseData = await response.json();

    expect(mockedAxios.delete).toHaveBeenCalledWith(`${mockBaseUrl}/profile/${mockUserId}/`, {
      headers: {
        Authorization: `Token ${mockToken}`,
      },
    });
    expect(response.status).toBe(200);
    expect(responseData).toEqual({ success: true });
  });

  it('should successfully delete profile with status 204', async () => {
    mockedAxios.delete.mockResolvedValue({
      status: 204,
      data: null,
    });

    const mockRequest = createMockRequest({ userId: mockUserId, token: mockToken });
    const response = await DELETE(mockRequest);
    const responseData = await response.json();

    expect(mockedAxios.delete).toHaveBeenCalledWith(`${mockBaseUrl}/profile/${mockUserId}/`, {
      headers: {
        Authorization: `Token ${mockToken}`,
      },
    });
    expect(response.status).toBe(200);
    expect(responseData).toEqual({ success: true });
  });

  it('should handle unauthorized error (401)', async () => {
    mockedAxios.delete.mockRejectedValue({
      response: {
        status: 401,
        data: { error: 'Unauthorized' },
      },
    });

    const mockRequest = createMockRequest({ userId: mockUserId, token: mockToken });
    const response = await DELETE(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toEqual({
      error: 'Failed to delete user profile',
      details: '[object Object]'
    });
  });

  it('should handle backend error', async () => {
    mockedAxios.delete.mockRejectedValue({
      response: {
        status: 500,
        data: { error: 'Internal Server Error' },
      },
    });

    const mockRequest = createMockRequest({ userId: mockUserId, token: mockToken });
    const response = await DELETE(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toEqual({
      error: 'Failed to delete user profile',
      details: '[object Object]'
    });
  });

  it('should include trailing slash in DELETE URL', async () => {
    mockedAxios.delete.mockResolvedValue({
      status: 204,
      data: null,
    });

    const mockRequest = createMockRequest({ userId: mockUserId, token: mockToken });
    await DELETE(mockRequest);

    // Verify the URL has trailing slash (Django requirement)
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      expect.stringContaining(`/profile/${mockUserId}/`),
      expect.any(Object)
    );
  });

  it('should pass authorization header to backend', async () => {
    mockedAxios.delete.mockResolvedValue({
      status: 200,
      data: {},
    });

    const mockRequest = createMockRequest({ userId: mockUserId, token: mockToken });
    await DELETE(mockRequest);

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          Authorization: `Token ${mockToken}`,
        },
      })
    );
  });

  it('should extract userId from request body', async () => {
    mockedAxios.delete.mockResolvedValue({
      status: 200,
      data: {},
    });

    const customUserId = 456;
    const mockRequest = createMockRequest({ userId: customUserId, token: mockToken });
    await DELETE(mockRequest);

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `${mockBaseUrl}/profile/${customUserId}/`,
      expect.any(Object)
    );
  });
});
