// This hook is deprecated - use useChatStore instead
// Kept for compatibility with existing components

export interface Folder {
  id: string;
  user_id?: string;
  name: string;
  description?: string | null;
  color: string;
  created_at?: string;
  updated_at?: string;
}

export const useFolders = () => {
  // This hook is no longer used - useChatStore from Zustand handles all folder operations
  // Returning empty defaults for compatibility
  return {
    folders: [],
    loading: false,
    createFolder: async () => null,
    updateFolder: async () => {},
    deleteFolder: async () => {},
    loadFolders: async () => {},
  };
};
