import { useProfileEditStore } from '@/stores/profileEditStore';
import { act } from '@testing-library/react';

describe('profileEditStore', () => {
  beforeEach(() => {
    act(() => {
      useProfileEditStore.setState({ unsavedData: null });
    });
  });

  it('has null unsavedData initially', () => {
    expect(useProfileEditStore.getState().unsavedData).toBeNull();
  });

  it('setUnsavedData sets data', () => {
    const data = { display_name: 'Test User' };
    act(() => {
      useProfileEditStore.getState().setUnsavedData(data as any);
    });
    expect(useProfileEditStore.getState().unsavedData).toEqual(data);
  });

  it('clearUnsavedData resets to null', () => {
    act(() => {
      useProfileEditStore.getState().setUnsavedData({ display_name: 'Test' } as any);
    });
    expect(useProfileEditStore.getState().unsavedData).not.toBeNull();

    act(() => {
      useProfileEditStore.getState().clearUnsavedData();
    });
    expect(useProfileEditStore.getState().unsavedData).toBeNull();
  });
});
