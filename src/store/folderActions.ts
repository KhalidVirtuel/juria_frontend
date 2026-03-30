import { toast } from '@/hooks/use-toast';
import { ChatState, Folder } from './types';
import { foldersAPI } from '@/lib/api';

// Helper function to convert backend date strings to timestamps
const toTimestamp = (dateStr: string): number => new Date(dateStr).getTime();

// Helper function to convert backend folder to store format
const convertFolder = (folder: any): Folder => ({
  id: folder.id,
  name: folder.name,
  description: folder.description,
  color: folder.color || '#3b82f6',
  createdAt: toTimestamp(folder.createdAt),
  user_id: folder.userId,
  attachments: (folder.attachments || []).map((a: any) => ({
    id: a.id,
    name: a.name,
    type: a.type.toLowerCase() as any,
    url: a.url,
    size: a.size,
    uploadedAt: toTimestamp(a.uploadedAt),
    folderId: a.folderId,
  })),
  timeline: (folder.timeline || []).map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    type: t.type.toLowerCase() as any,
    date: toTimestamp(t.date),
    folderId: t.folderId,
    conversationId: t.conversationId || undefined, // ✅ AJOUTÉ
    createdAt: toTimestamp(t.createdAt),
  })),
  documents: (folder.documents || []).map((d: any) => ({
    id: d.id,
    title: d.title,
    type: d.type.toLowerCase() as any,
    content: d.content,
    folderId: d.folderId,
    createdAt: toTimestamp(d.createdAt),
    lastModified: toTimestamp(d.lastModified),
  })),
  deadlines: (folder.deadlines || []).map((d: any) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    dueDate: toTimestamp(d.dueDate),
    priority: d.priority.toLowerCase() as any,
    status: d.status.toLowerCase() as any,
    folderId: d.folderId,
    createdAt: toTimestamp(d.createdAt),
  })),
});

export const createFolderActions = (set: any) => ({
  createFolder: async (name: string, description?: string, color?: string): Promise<string> => {
    try {
      // Create folder on backend
      const { folder } = await foldersAPI.create({
        name,
        description,
        color: color || '#3b82f6',
      });

      const convertedFolder = convertFolder(folder);

      // Add to local state
      set((state: ChatState) => ({
        folders: [convertedFolder, ...state.folders],
      }));

      toast({
        title: "Succès",
        description: "Dossier créé avec succès"
      });

      return folder.id;
    } catch (error: any) {
      console.error('Error creating folder:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Une erreur est survenue lors de la création du dossier.",
        variant: "destructive"
      });
      return '';
    }
  },

  updateFolderName: async (id: string, name: string): Promise<void> => {
    try {
      // Update on backend
      await foldersAPI.update(id, { name });

      // Update local state
      set((state: ChatState) => ({
        folders: state.folders.map((folder) => {
          if (folder.id === id) {
            return { ...folder, name };
          }
          return folder;
        }),
      }));

      toast({
        title: "Succès",
        description: "Nom du dossier mis à jour"
      });
    } catch (error: any) {
      console.error('Error updating folder name:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Une erreur est survenue lors de la mise à jour du nom du dossier.",
        variant: "destructive"
      });
    }
  },

  // ✅ Recharger un dossier depuis l'API
  loadFolder: async (folderId: string): Promise<Folder> => {
    console.log('🔍 [STORE] Loading folder:', folderId);
    
    try {
      // Utiliser foldersAPI pour récupérer le dossier
      const { folder } = await foldersAPI.getById(folderId);
      
      // ✅ IMPORTANT : Convertir le dossier avec convertFolder
      const convertedFolder = convertFolder(folder);
      
      console.log('✅ [STORE] Folder loaded:', convertedFolder.name);
      
      // Mettre à jour le dossier dans le state
      set((state: ChatState) => ({
        folders: state.folders.map(f => 
          f.id === folderId ? convertedFolder : f
        )
      }));
      
      return convertedFolder;
    } catch (error) {
      console.error('❌ [STORE] Error loading folder:', error);
      throw error;
    }
  },

  deleteFolder: async (id: string): Promise<void> => {
    try {
      // Delete from backend
      await foldersAPI.delete(id);

      // Update local state
      set((state: ChatState) => {
        // Update conversations that were in the deleted folder
        const updatedConversations = state.conversations.map((convo) => {
          if (convo.folderId === id) {
            return { ...convo, folderId: null };
          }
          return convo;
        });

        return {
          folders: state.folders.filter((f) => f.id !== id),
          conversations: updatedConversations,
        };
      });

      toast({
        title: "Succès",
        description: "Dossier supprimé avec succès"
      });
    } catch (error: any) {
      console.error('Error deleting folder:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Une erreur est survenue lors de la suppression du dossier.",
        variant: "destructive"
      });
    }
  },
}); 