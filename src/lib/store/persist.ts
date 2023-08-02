import { IPost } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppPerisistState {
  post: IPost;
  setPost: (post: IPost) => void;
}

export const usePersistStore = create(
  persist<AppPerisistState>(
    (set, get) => ({
      post: {
        title: "",
        previewContent: "Note",
        content: "# Note",
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      setPost: (post) => set(() => ({ post })),
    }),
    {
      name: "buymeastorage.store",
    }
  )
);

export default usePersistStore;