import { create } from "zustand";
import { ArAccount } from "arweave-account";

interface LoggedInUserState {
  userAccount: ArAccount | null;
  setUserAccount: (userAccount: ArAccount) => void;
}

interface ViewedUserProfileState {
  viewedAccount: ArAccount | null; // Renamed for clarity
  setViewedAccount: (viewedAccount: ArAccount) => void; // Renamed for clarity
}

export const useConnectedUserStore = create<LoggedInUserState>((set) => ({
  userAccount: null,
  setUserAccount: (userAccount: ArAccount) => set(() => ({ userAccount })),
}));

export const useViewedUserProfileStore = create<ViewedUserProfileState>(
  (set) => ({
    viewedAccount: null,
    setViewedAccount: (viewedAccount: ArAccount) =>
      set(() => ({ viewedAccount })),
  })
);
