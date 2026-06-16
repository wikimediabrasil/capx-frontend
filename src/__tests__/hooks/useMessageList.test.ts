jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { token: 'test-token' } },
    status: 'authenticated',
  })),
}));

jest.mock('@/services/messageService', () => ({
  MessageService: {
    getMessages: jest.fn(),
  },
}));

import { renderHook, waitFor } from '@testing-library/react';
import { useMessageList } from '@/hooks/useMessageList';
import { MessageService } from '@/services/messageService';

const mockGetMessages = MessageService.getMessages as jest.Mock;

describe('useMessageList', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches messages on mount', async () => {
    const mockMessages = [{ id: 1, content: 'Hello' }];
    mockGetMessages.mockResolvedValue(mockMessages);

    const { result } = renderHook(() => useMessageList());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.messages).toEqual(mockMessages);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    mockGetMessages.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useMessageList());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('Could not load messages');
    expect(result.current.messages).toEqual([]);
  });

  it('formats date correctly', () => {
    mockGetMessages.mockResolvedValue([]);
    const { result } = renderHook(() => useMessageList());

    const formatted = result.current.formatDate('2024-01-15T10:30:00Z');
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('15');
  });

  it('does not fetch without token', async () => {
    const { useSession } = require('next-auth/react');
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    renderHook(() => useMessageList());
    expect(mockGetMessages).not.toHaveBeenCalled();
  });
});
