const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: mockPush })),
}));

jest.mock('next-auth/react', () => ({
  signOut: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('axios');

import { renderHook, act } from '@testing-library/react';
import { useProfileForm } from '@/hooks/useProfileForm';
import axios from 'axios';

const mockAxiosPut = axios.put as jest.Mock;
const mockAxiosDelete = axios.delete as jest.Mock;

const initialData = {
  userData: {
    user: { id: 1, username: 'testuser' },
    skills_known: [1, 2, 3],
    skills_available: [1, 2],
    bio: 'Hello',
  },
};

const session = {
  sessionStatus: 'authenticated',
  sessionData: {
    user: { id: 1, username: 'testuser', token: 'test-token', language: 'en' },
  },
};

describe('useProfileForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns initial state', () => {
    const { result } = renderHook(() => useProfileForm(initialData, session));
    expect(result.current.formData).toEqual(initialData);
    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.updatingData).toBe(false);
  });

  it('handleTextInputChange updates userData field', () => {
    const { result } = renderHook(() => useProfileForm(initialData, session));

    act(() => {
      result.current.handleTextInputChange('New bio', { name: 'bio' });
    });

    expect(result.current.formData.userData.bio).toBe('New bio');
  });

  it('handleSingleSelectInputChange updates field', () => {
    const { result } = renderHook(() => useProfileForm(initialData, session));

    act(() => {
      result.current.handleSingleSelectInputChange({ value: 'pt' }, { name: 'language' });
    });

    expect(result.current.formData.userData.language).toBe('pt');
  });

  it('handleMultiSelectInputChange updates field', () => {
    const { result } = renderHook(() => useProfileForm(initialData, session));

    act(() => {
      result.current.handleMultiSelectInputChange(
        [{ value: 1 }, { value: 4 }],
        { name: 'skills_known' }
      );
    });

    expect(result.current.formData.userData.skills_known).toEqual([1, 4]);
  });

  it('handleMultiSelectInputChange removes skills_available when skills_known removed', () => {
    const { result } = renderHook(() => useProfileForm(initialData, session));

    act(() => {
      // Remove skill 2 from skills_known (was [1,2,3], now [1,3])
      result.current.handleMultiSelectInputChange(
        [{ value: 1 }, { value: 3 }],
        { name: 'skills_known' }
      );
    });

    // skills_available should have skill 2 removed (was [1,2], now [1])
    expect(result.current.formData.userData.skills_available).toEqual([1]);
  });

  it('handleSubmit calls PUT and redirects', async () => {
    mockAxiosPut.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useProfileForm(initialData, session));

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });

    expect(mockAxiosPut).toHaveBeenCalledWith(
      '/api/profile',
      expect.any(Object),
      expect.objectContaining({
        headers: { Authorization: 'Token test-token' },
      })
    );
    expect(mockPush).toHaveBeenCalledWith('/profile');
  });

  it('handleSubmit handles error', async () => {
    mockAxiosPut.mockRejectedValue(new Error('Update failed'));

    const { result } = renderHook(() => useProfileForm(initialData, session));

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });

    expect(result.current.updatingData).toBe(false);
  });

  it('setIsModalOpen toggles modal', () => {
    const { result } = renderHook(() => useProfileForm(initialData, session));

    act(() => result.current.setIsModalOpen(true));
    expect(result.current.isModalOpen).toBe(true);
  });

  it('setConfirmationUsername updates state', () => {
    const { result } = renderHook(() => useProfileForm(initialData, session));

    act(() => result.current.setConfirmationUsername('testuser'));
    expect(result.current.confirmationUsername).toBe('testuser');
  });

  it('handleSubmit does nothing when session is not authenticated', async () => {
    const unauthSession = { ...session, sessionStatus: 'unauthenticated' };
    const { result } = renderHook(() => useProfileForm(initialData, unauthSession));

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
    });

    expect(mockAxiosPut).not.toHaveBeenCalled();
  });

  it('handleDelete alerts when usernames do not match', async () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useProfileForm(initialData, session));

    // confirmationUsername is '' by default, doesn't match 'testuser'
    await act(async () => {
      await result.current.handleDelete({ preventDefault: jest.fn() } as any);
    });

    expect(mockAlert).toHaveBeenCalledWith('Usernames do not match');
    expect(mockAxiosDelete).not.toHaveBeenCalled();
    mockAlert.mockRestore();
  });

  it('handleDelete alerts when session is not authenticated', async () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const unauthSession = { ...session, sessionStatus: 'unauthenticated' };
    const { result } = renderHook(() => useProfileForm(initialData, unauthSession));

    act(() => result.current.setConfirmationUsername('testuser'));

    await act(async () => {
      await result.current.handleDelete({ preventDefault: jest.fn() } as any);
    });

    expect(mockAlert).toHaveBeenCalledWith('Usernames do not match');
    expect(mockAxiosDelete).not.toHaveBeenCalled();
    mockAlert.mockRestore();
  });

  it('handleDelete calls DELETE, signOut, and redirects on success', async () => {
    const { signOut } = require('next-auth/react');
    mockAxiosDelete.mockResolvedValue({});
    const { result } = renderHook(() => useProfileForm(initialData, session));

    act(() => result.current.setConfirmationUsername('testuser'));

    await act(async () => {
      await result.current.handleDelete({ preventDefault: jest.fn() } as any);
    });

    expect(mockAxiosDelete).toHaveBeenCalledWith(
      '/api/profile',
      expect.objectContaining({
        headers: { Authorization: 'Token test-token' },
        data: { user: { id: 1 } },
      })
    );
    expect(signOut).toHaveBeenCalled();
  });

  it('handleDelete handles delete error gracefully', async () => {
    mockAxiosDelete.mockRejectedValue(new Error('Delete failed'));
    const { result } = renderHook(() => useProfileForm(initialData, session));

    act(() => result.current.setConfirmationUsername('testuser'));

    await act(async () => {
      await result.current.handleDelete({ preventDefault: jest.fn() } as any);
    });

    // Should not throw
    expect(mockAxiosDelete).toHaveBeenCalled();
  });

  it('handleMultiSelectInputChange updates non-skills_known fields directly', () => {
    const { result } = renderHook(() => useProfileForm(initialData, session));

    act(() => {
      result.current.handleMultiSelectInputChange(
        [{ value: 'CEECA' }, { value: 'LAC' }],
        { name: 'territory' }
      );
    });

    expect(result.current.formData.userData.territory).toEqual(['CEECA', 'LAC']);
  });

  it('handleMultiSelectInputChange does not filter skills_available when no skills removed', () => {
    const { result } = renderHook(() => useProfileForm(initialData, session));

    act(() => {
      // Add a new skill without removing existing ones
      result.current.handleMultiSelectInputChange(
        [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }],
        { name: 'skills_known' }
      );
    });

    // skills_available should remain unchanged since no skills were removed
    expect(result.current.formData.userData.skills_available).toEqual([1, 2]);
  });

  it('handleLoadPictures calls callback with images and fetches API', async () => {
    const mockGet = axios.get as jest.Mock;
    mockGet
      .mockResolvedValueOnce({ data: ['image1.jpg', 'image2.jpg'] })
      .mockResolvedValue({ data: { image: 'thumb.png' } });

    const callback = jest.fn();
    const { result } = renderHook(() => useProfileForm(initialData, session));

    await act(async () => {
      await result.current.handleLoadPictures('wiki', callback);
    });

    expect(mockGet).toHaveBeenCalledWith('/api/profile_image?query=wiki');
    // callback is called at least once (initial images call)
    expect(callback).toHaveBeenCalled();
    // First call has the initial images with original labels
    const firstCall = callback.mock.calls[0][0];
    expect(firstCall).toHaveLength(2);
    expect(firstCall[0].label).toBe('image1.jpg');
  });
});
