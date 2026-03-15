import { create } from "zustand";
import type { UserResponse } from "@/features/auth/types";

type AuthStore = {
  user: UserResponse | null;
  setUser: (user: UserResponse) => void;
  clearUser: () => void;
};

const useAuthStore = create<AuthStore>((set) => ({
  // initial state
  user: null,

  // actions
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

export default useAuthStore;
