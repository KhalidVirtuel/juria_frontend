import { useMemo } from 'react';
import { useChatStore } from '@/store/chatStore';

export interface Folder {
  id: string;
  user_id?: string;
  name: string;
  description?: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export const useFolders = () => {
  const {
    folders,
    createFolder: createFolderAction,
    deleteFolder,
    updateFolderName,
  } = useChatStore();

  const formattedFolders = useMemo<Folder[]>(
    () =>
      folders.map((folder) => ({
        id: folder.id,
        user_id: folder.user_id,
        name: folder.name,
        description: folder.description ?? null,
        color: folder.color ?? '#3b82f6',
        created_at: new Date(folder.createdAt).toISOString(),
        updated_at: new Date(folder.createdAt).toISOString(),
      })),
    [folders]
  );

  const createFolder = async (name: string, description?: string, color?: string) => {
    return createFolderAction(name, description, color);
  };

  const updateFolder = async (id: string, data: Partial<Folder>) => {
    if (data.name) {
      await updateFolderName(id, data.name);
    }
    // Additional updates (description/color) can be added as backend endpoints become available
  };

  const loadFolders = async () => {
    // Les dossiers sont chargés automatiquement via initialize()
  };

  return {
    folders: formattedFolders,
    loading: false,
    createFolder,
    updateFolder,
    deleteFolder,
    loadFolders,
  };
};
