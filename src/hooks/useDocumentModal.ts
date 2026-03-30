import { create } from 'zustand';

interface DocumentModalState {
  openDocumentId: string | null;
  setOpenDocumentId: (id: string | null) => void;
}

export const useDocumentModal = create<DocumentModalState>((set) => ({
  openDocumentId: null,
  setOpenDocumentId: (id) => set({ openDocumentId: id }),
}));