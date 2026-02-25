'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Profile } from '@/types/profile';
import { ProfileEditStore } from './types';

const initialState = {
  unsavedData: null as Partial<Profile> | null,
};

export const useProfileEditStore = create<ProfileEditStore>()(
  devtools(
    set => ({
      ...initialState,

      setUnsavedData: (data: Partial<Profile> | null) => {
        set({ unsavedData: data });
      },

      clearUnsavedData: () => {
        set({ unsavedData: null });
      },
    }),
    { name: 'ProfileEditStore', enabled: process.env.NODE_ENV === 'development' }
  )
);

// Selector hooks
export const useUnsavedData = () => useProfileEditStore(state => state.unsavedData);
