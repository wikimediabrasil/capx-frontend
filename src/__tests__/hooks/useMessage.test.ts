import { renderHook, act } from '@testing-library/react';
import { useMessage } from '@/hooks/useMessage';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { token: 'test-token', name: 'testuser' } },
    status: 'authenticated',
  })),
}));

jest.mock('@/services/messageService', () => ({
  MessageService: {
    sendMessage: jest.fn(),
  },
}));

import { useSession } from 'next-auth/react';
import { MessageService } from '@/services/messageService';

const mockUseSession = useSession as jest.Mock;
const mockSendMessage = MessageService.sendMessage as jest.Mock;

describe('useMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseSession.mockReturnValue({
      data: { user: { token: 'test-token', name: 'testuser' } },
      status: 'authenticated',
    });
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useMessage());

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.showMethodSelector).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.sendMessage).toBe('function');
    expect(typeof result.current.setShowMethodSelector).toBe('function');
  });

  it('sets isSubmitting to true while sending a message', async () => {
    let resolveSend: (value: any) => void;
    mockSendMessage.mockReturnValue(
      new Promise(resolve => {
        resolveSend = resolve;
      })
    );

    const { result } = renderHook(() => useMessage());

    act(() => {
      result.current.sendMessage({ receiver: 1, body: 'Hello' });
    });

    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      resolveSend!({ id: 1, receiver: 1, body: 'Hello' });
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  it('calls MessageService.sendMessage with the correct arguments', async () => {
    const mockResponse = { id: 42, receiver: 1, body: 'Hello' };
    mockSendMessage.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useMessage());

    await act(async () => {
      await result.current.sendMessage({ receiver: 1, body: 'Hello' });
    });

    expect(mockSendMessage).toHaveBeenCalledWith({
      message: { receiver: 1, body: 'Hello' },
      token: 'test-token',
    });
  });

  it('returns the response from sendMessage on success', async () => {
    const mockResponse = { id: 42, receiver: 1, body: 'Hello' };
    mockSendMessage.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useMessage());

    let response: any;
    await act(async () => {
      response = await result.current.sendMessage({ receiver: 1, body: 'Hello' });
    });

    expect(response).toEqual(mockResponse);
  });

  it('throws and sets error when sendMessage returns invalid response', async () => {
    mockSendMessage.mockResolvedValue(null);

    const { result } = renderHook(() => useMessage());

    await act(async () => {
      await expect(result.current.sendMessage({ receiver: 1, body: 'Hello' })).rejects.toThrow(
        'Invalid message response from server'
      );
    });

    expect(result.current.error).toBe('Invalid message response from server');
  });

  it('throws and sets error when sendMessage returns a response without id', async () => {
    mockSendMessage.mockResolvedValue({ body: 'missing id' });

    const { result } = renderHook(() => useMessage());

    await act(async () => {
      await expect(result.current.sendMessage({ receiver: 1, body: 'Hello' })).rejects.toThrow(
        'Invalid message response from server'
      );
    });

    expect(result.current.error).toBe('Invalid message response from server');
  });

  it('sets error when the service throws an error', async () => {
    const testError = new Error('Network error');
    mockSendMessage.mockRejectedValue(testError);

    const { result } = renderHook(() => useMessage());

    await act(async () => {
      await expect(result.current.sendMessage({ receiver: 1, body: 'Hello' })).rejects.toThrow(
        'Network error'
      );
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.isSubmitting).toBe(false);
  });

  it('resets isSubmitting to false after an error', async () => {
    mockSendMessage.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useMessage());

    await act(async () => {
      try {
        await result.current.sendMessage({ receiver: 1, body: 'Hello' });
      } catch {
        // expected
      }
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  it('uses an empty string as token when session has no token', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'testuser' } },
      status: 'authenticated',
    });

    mockSendMessage.mockResolvedValue({ id: 1 });

    const { result } = renderHook(() => useMessage());

    await act(async () => {
      await result.current.sendMessage({ receiver: 1, body: 'Hello' });
    });

    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ token: '' })
    );
  });

  it('toggles showMethodSelector correctly', () => {
    const { result } = renderHook(() => useMessage());

    expect(result.current.showMethodSelector).toBe(false);

    act(() => {
      result.current.setShowMethodSelector(true);
    });

    expect(result.current.showMethodSelector).toBe(true);

    act(() => {
      result.current.setShowMethodSelector(false);
    });

    expect(result.current.showMethodSelector).toBe(false);
  });
});
