import { DELETE } from '@/app/api/profile/route';
import { NextRequest } from 'next/server';
import axios from 'axios';

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
    // Mock successful delete response
    mockedAxios.delete.mockResolvedValue({
      status: 200,
      data: { success: true },
    });

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        user: { id: mockUserId },
      }),
      headers: {
        get: jest.fn((header: string) => {
          if (header === 'authorization') return `Token ${mockToken}`;
          return null;
        }),
      },
    } as unknown as NextRequest;

    const response = await DELETE(mockRequest);
    const responseData = await response.json();

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `${mockBaseUrl}/profile/${mockUserId}/`,
      {
        headers: {
          Authorization: `Token ${mockToken}`,
        },
      }
    );
    expect(response.status).toBe(200);
    expect(responseData).toEqual({ success: true });
  });

  it('should successfully delete profile with status 204', async () => {
    // Mock delete response with 204 No Content
    mockedAxios.delete.mockResolvedValue({
      status: 204,
      data: null,
    });

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        user: { id: mockUserId },
      }),
      headers: {
        get: jest.fn((header: string) => {
          if (header === 'authorization') return `Token ${mockToken}`;
          return null;
        }),
      },
    } as unknown as NextRequest;

    const response = await DELETE(mockRequest);
    const responseData = await response.json();

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `${mockBaseUrl}/profile/${mockUserId}/`,
      {
        headers: {
          Authorization: `Token ${mockToken}`,
        },
      }
    );
    expect(response.status).toBe(200);
    expect(responseData).toEqual({ success: true });
  });

  it('should handle unauthorized error (401)', async () => {
    // Mock unauthorized error
    mockedAxios.delete.mockRejectedValue({
      response: {
        status: 401,
        data: { error: 'Unauthorized' },
      },
    });

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        user: { id: mockUserId },
      }),
      headers: {
        get: jest.fn((header: string) => {
          if (header === 'authorization') return `Token ${mockToken}`;
          return null;
        }),
      },
    } as unknown as NextRequest;

    const response = await DELETE(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toEqual({ error: 'Failed to delete user profile' });
  });

  it('should handle backend error', async () => {
    // Mock backend error
    mockedAxios.delete.mockRejectedValue({
      response: {
        status: 500,
        data: { error: 'Internal Server Error' },
      },
    });

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        user: { id: mockUserId },
      }),
      headers: {
        get: jest.fn((header: string) => {
          if (header === 'authorization') return `Token ${mockToken}`;
          return null;
        }),
      },
    } as unknown as NextRequest;

    const response = await DELETE(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toEqual({ error: 'Failed to delete user profile' });
  });

  it('should include trailing slash in DELETE URL', async () => {
    mockedAxios.delete.mockResolvedValue({
      status: 204,
      data: null,
    });

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        user: { id: mockUserId },
      }),
      headers: {
        get: jest.fn((header: string) => {
          if (header === 'authorization') return `Token ${mockToken}`;
          return null;
        }),
      },
    } as unknown as NextRequest;

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

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        user: { id: mockUserId },
      }),
      headers: {
        get: jest.fn((header: string) => {
          if (header === 'authorization') return `Token ${mockToken}`;
          return null;
        }),
      },
    } as unknown as NextRequest;

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
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        user: { id: customUserId },
      }),
      headers: {
        get: jest.fn((header: string) => {
          if (header === 'authorization') return `Token ${mockToken}`;
          return null;
        }),
      },
    } as unknown as NextRequest;

    await DELETE(mockRequest);

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `${mockBaseUrl}/profile/${customUserId}/`,
      expect.any(Object)
    );
  });
});
