import { IPost } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppPerisistState {
  post: IPost;
  setPost: (post: Partial<IPost>) => void;
}

export const usePersistStore = create(
  persist<AppPerisistState>(
    (set, get) => ({
      post: {
        title: "",
        description: "",
        content: "",
        topics: "",
      },
      setPost: (newPost: Partial<IPost>) =>
        set((state) => ({ post: { ...state.post, ...newPost } })),
    }),
    {
      name: "buymeastorage.store",
    }
  )
);

export default usePersistStore;
