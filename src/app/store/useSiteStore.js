"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const useSiteStore = create(
  persist(
    (set) => ({
      isFirstRender: true,
      hasHydrated: false,
      completeFirstRender: () => set({ isFirstRender: false }),
      completeHydration: () => set({ hasHydrated: true }),
    }),
    {
      name: "art-gallery-site-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ isFirstRender: state.isFirstRender }),
      skipHydration: true,
    },
  ),
);

export default useSiteStore;
