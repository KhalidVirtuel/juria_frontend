import { toast } from '@/hooks/use-toast';
import { ChatState, Attachment, TimelineEntry, GeneratedDocument, Deadline } from './types';
import { foldersAPI } from '@/lib/api';

// Helper function to convert backend date strings or numeric timestamps to timestamps
const toTimestamp = (date: string | number): number =>
  typeof date === 'number' ? date : new Date(date).getTime();

export const createFolderEnhancedActions = (set: any, get: any) => ({

  addAttachment: async (folderId: string, data: { name: string; type: any; url?: string; size?: number }) => {
  const { attachment: a } = await foldersAPI.addAttachment(folderId, data);

  // adapter au shape du store (uploadedAt: number)
  const attForStore = {
    id: String(a.id),
    folderId: String(a.folderId),
    name: a.name,
    type: a.type, // déjà en minuscule par backend
    url: a.url,
    size: a.size ?? 0,
    uploadedAt: new Date(a.uploadedAt).getTime(),
  };

  set((state: any) => ({
    folders: state.folders.map((f: any) =>
      f.id === String(folderId)
        ? { ...f, attachments: [attForStore, ...(f.attachments || [])] }
        : f
    ),
  }));
    },

    removeAttachment: async (folderId: string, attachmentId: string) => {
      await foldersAPI.deleteAttachment(attachmentId);
      set((state: any) => ({
        folders: state.folders.map((f: any) =>
          f.id === String(folderId)
            ? { ...f, attachments: (f.attachments || []).filter((x: any) => x.id !== attachmentId) }
            : f
        ),
      }));
    },
  // Attachment actions
  uploadAttachment: async (folderId: string, attachment: Omit<Attachment, 'id' | 'folderId' | 'uploadedAt'>): Promise<void> => {
    try {
      // Call backend API
      const { attachment: newAttachment } = await foldersAPI.addAttachment(folderId, {
        name: attachment.name,
        type: attachment.type.toUpperCase(),
        url: attachment.url,
        size: attachment.size,
      });

      // Convert to store format
      const convertedAttachment: Attachment = {
        id: newAttachment.id,
        name: newAttachment.name,
        type: newAttachment.type.toLowerCase() as any,
        url: newAttachment.url,
        size: newAttachment.size,
        folderId: newAttachment.folderId,
        uploadedAt: toTimestamp(newAttachment.uploadedAt),
      };

      // Update local state
      set((state: ChatState) => ({
        folders: state.folders.map(folder =>
          folder.id === folderId
            ? { ...folder, attachments: [...folder.attachments, convertedAttachment] }
            : folder
        ),
      }));

      toast({
        title: "Succès",
        description: "Pièce jointe ajoutée avec succès"
      });
    } catch (error: any) {
      console.error('Error adding attachment:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Erreur lors de l'ajout de la pièce jointe",
        variant: "destructive"
      });
    }
  },
/*
  removeAttachment: async (folderId: string, attachmentId: string): Promise<void> => {
    try {
      // Call backend API
      await foldersAPI.deleteAttachment(attachmentId);

      // Update local state
      set((state: ChatState) => ({
        folders: state.folders.map(folder =>
          folder.id === folderId
            ? { ...folder, attachments: folder.attachments.filter(att => att.id !== attachmentId) }
            : folder
        ),
      }));

      toast({
        title: "Succès",
        description: "Pièce jointe supprimée"
      });
    } catch (error: any) {
      console.error('Error removing attachment:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Erreur lors de la suppression de la pièce jointe",
        variant: "destructive"
      });
    }
  },
*/
  // Timeline actions
// Remplacer l'action addTimelineEntry existante par :

addTimelineEntry: async (folderId: string, entry: Omit<TimelineEntry, 'id' | 'folderId' | 'createdAt'>): Promise<void> => {
  try {
    const { entry: newEntry } = await foldersAPI.addTimelineEntry(folderId, {
      title: entry.title,
      description: entry.description,
      type: (entry.type || 'EVENT').toLowerCase(),
      date: new Date(entry.date).toISOString(),
      showInCalendar: entry.showInCalendar ?? true, // ✅ AJOUTÉ
    });

    const convertedEntry: TimelineEntry = {
      id: newEntry.id,
      title: newEntry.title,
      description: newEntry.description,
      type: newEntry.type.toLowerCase() as any,
      date: toTimestamp(newEntry.date),
      folderId: newEntry.folderId,
      createdAt: toTimestamp(newEntry.createdAt),
      showInCalendar: newEntry.showInCalendar ?? true, // ✅ AJOUTÉ
    };

    set((state: ChatState) => ({
      folders: state.folders.map(folder =>
        folder.id === folderId
          ? { ...folder, timeline: [...folder.timeline, convertedEntry].sort((a, b) => b.date - a.date) }
          : folder
      ),
    }));

    toast({ title: "Succès", description: "Événement ajouté à la chronologie" });
  } catch (error: any) {
    console.error('Error adding timeline entry:', error);
    toast({
      title: "Erreur",
      description: error.response?.data?.error || "Erreur lors de l'ajout à la chronologie",
      variant: "destructive"
    });
  }
},
  updateTimelineEntry: async (folderId: string, entryId: string, updates: Partial<TimelineEntry>): Promise<void> => {
    try {
      // Update local state (backend doesn't have update endpoint yet)
      set((state: ChatState) => ({
        folders: state.folders.map(folder =>
          folder.id === folderId
            ? {
                ...folder,
                timeline: folder.timeline.map(entry =>
                  entry.id === entryId ? { ...entry, ...updates } : entry
                ).sort((a, b) => b.date - a.date)
              }
            : folder
        ),
      }));

      toast({
        title: "Succès",
        description: "Événement mis à jour"
      });
    } catch (error: any) {
      console.error('Error updating timeline entry:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Erreur lors de la mise à jour",
        variant: "destructive"
      });
    }
  },

  removeTimelineEntry: async (folderId: string, entryId: string): Promise<void> => {
    try {
      // Call backend API
      await foldersAPI.deleteTimelineEntry(entryId);

      // Update local state
      set((state: ChatState) => ({
        folders: state.folders.map(folder =>
          folder.id === folderId
            ? { ...folder, timeline: folder.timeline.filter(entry => entry.id !== entryId) }
            : folder
        ),
      }));

      toast({
        title: "Succès",
        description: "Événement supprimé de la chronologie"
      });
    } catch (error: any) {
      console.error('Error removing timeline entry:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Erreur lors de la suppression",
        variant: "destructive"
      });
    }
  },

  // Document actions
  addDocument: async (folderId: string, document: Omit<GeneratedDocument, 'id' | 'folderId' | 'createdAt' | 'lastModified'>): Promise<void> => {
    try {
      // Call backend API
      const { document: newDocument } = await foldersAPI.addDocument(folderId, {
        title: document.title,
        type: document.type.toUpperCase(),
        content: document.content,
      });

      // Convert to store format
      const convertedDocument: GeneratedDocument = {
        id: newDocument.id,
        title: newDocument.title,
        type: newDocument.type.toLowerCase() as any,
        content: newDocument.content,
        folderId: newDocument.folderId,
        createdAt: toTimestamp(newDocument.createdAt),
        lastModified: toTimestamp(newDocument.lastModified),
      };

      // Update local state
      set((state: ChatState) => ({
        folders: state.folders.map(folder =>
          folder.id === folderId
            ? { ...folder, documents: [...folder.documents, convertedDocument] }
            : folder
        ),
      }));

      toast({
        title: "Succès",
        description: "Document généré avec succès"
      });
    } catch (error: any) {
      console.error('Error adding document:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Erreur lors de la génération du document",
        variant: "destructive"
      });
    }
  },

  updateDocument: async (folderId: string, documentId: string, updates: Partial<GeneratedDocument>): Promise<void> => {
    try {
      // Call backend API
      await foldersAPI.updateDocument(documentId, {
        title: updates.title,
        content: updates.content,
      });

      // Update local state
      set((state: ChatState) => ({
        folders: state.folders.map(folder =>
          folder.id === folderId
            ? {
                ...folder,
                documents: folder.documents.map(doc =>
                  doc.id === documentId
                    ? { ...doc, ...updates, lastModified: Date.now() }
                    : doc
                )
              }
            : folder
        ),
      }));

      toast({
        title: "Succès",
        description: "Document mis à jour"
      });
    } catch (error: any) {
      console.error('Error updating document:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Erreur lors de la mise à jour du document",
        variant: "destructive"
      });
    }
  },

  removeDocument: async (folderId: string, documentId: string): Promise<void> => {
    try {
      // Call backend API
      await foldersAPI.deleteDocument(documentId);

      // Update local state
      set((state: ChatState) => ({
        folders: state.folders.map(folder =>
          folder.id === folderId
            ? { ...folder, documents: folder.documents.filter(doc => doc.id !== documentId) }
            : folder
        ),
      }));

      toast({
        title: "Succès",
        description: "Document supprimé"
      });
    } catch (error: any) {
      console.error('Error removing document:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Erreur lors de la suppression du document",
        variant: "destructive"
      });
    }
  },

  // Deadline actions
  addDeadline: async (folderId: string, deadline: Omit<Deadline, 'id' | 'folderId' | 'createdAt'>): Promise<void> => {
    try {
      // Call backend API
      const { deadline: newDeadline } = await foldersAPI.addDeadline(folderId, {
        title: deadline.title,
        description: deadline.description,
        dueDate: new Date(deadline.dueDate).toISOString(),
        priority: deadline.priority.toUpperCase(),
      });

      // Convert to store format
      const convertedDeadline: Deadline = {
        id: newDeadline.id,
        title: newDeadline.title,
        description: newDeadline.description,
        dueDate: toTimestamp(newDeadline.dueDate),
        priority: newDeadline.priority.toLowerCase() as any,
        status: newDeadline.status.toLowerCase() as any,
        folderId: newDeadline.folderId,
        createdAt: toTimestamp(newDeadline.createdAt),
      };

      // Update local state
      set((state: ChatState) => ({
        folders: state.folders.map(folder =>
          folder.id === folderId
            ? { ...folder, deadlines: [...folder.deadlines, convertedDeadline].sort((a, b) => a.dueDate - b.dueDate) }
            : folder
        ),
      }));

      toast({
        title: "Succès",
        description: "Échéance ajoutée"
      });
    } catch (error: any) {
      console.error('Error adding deadline:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Erreur lors de l'ajout de l'échéance",
        variant: "destructive"
      });
    }
  },

  updateDeadline: async (folderId: string, deadlineId: string, updates: Partial<Deadline>): Promise<void> => {
    try {
      // If status is being updated, call backend API
      if (updates.status) {
        await foldersAPI.updateDeadlineStatus(deadlineId, updates.status.toUpperCase());
      }

      // Update local state
      set((state: ChatState) => ({
        folders: state.folders.map(folder =>
          folder.id === folderId
            ? {
                ...folder,
                deadlines: folder.deadlines.map(deadline =>
                  deadline.id === deadlineId ? { ...deadline, ...updates } : deadline
                ).sort((a, b) => a.dueDate - b.dueDate)
              }
            : folder
        ),
      }));

      toast({
        title: "Succès",
        description: "Échéance mise à jour"
      });
    } catch (error: any) {
      console.error('Error updating deadline:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Erreur lors de la mise à jour de l'échéance",
        variant: "destructive"
      });
    }
  },

  removeDeadline: async (folderId: string, deadlineId: string): Promise<void> => {
    try {
      // Call backend API
      await foldersAPI.deleteDeadline(deadlineId);

      // Update local state
      set((state: ChatState) => ({
        folders: state.folders.map(folder =>
          folder.id === folderId
            ? { ...folder, deadlines: folder.deadlines.filter(deadline => deadline.id !== deadlineId) }
            : folder
        ),
      }));

      toast({
        title: "Succès",
        description: "Échéance supprimée"
      });
    } catch (error: any) {
      console.error('Error removing deadline:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Erreur lors de la suppression de l'échéance",
        variant: "destructive"
      });
    }
  },
});
