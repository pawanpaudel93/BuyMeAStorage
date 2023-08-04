import { create } from "zustand";
import { ArAccount } from "arweave-account";

interface AppState {
  userAccount: ArAccount | null;
  setUserAccount: (userAccount: ArAccount) => void;
}

export const useAppStore = create<AppState>((set) => ({
  userAccount: null,
  setUserAccount: (userAccount: ArAccount) => set(() => ({ userAccount })),
}));

export default useAppStore;
