import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatState } from './types';
import { initializeStore, createBasicActions } from './storeInitialization';
import { createConversationActions, createWorkflowActions } from './conversationActions';
import { createFolderActions } from './folderActions';
import { createFolderEnhancedActions } from './folderEnhancedActions';

export type { Message, Conversation, Folder } from './types';

// Nettoyage au démarrage
if (typeof window !== 'undefined') {
  const oldKeys = [
    'law-assistant-storage',
    'law-assistant-storage-v1',
    'law-assistant-storage_2',
    'law-assistant-storage_v2'
  ];
  
  oldKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
      console.log(`🧹 Cache supprimé: ${key}`);
    } catch (e) {
      console.warn('Erreur suppression cache:', e);
    }
  });
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      folders: [],
      activeConversationId: null,
      activeFolderId: null,
      sidebarOpen: true,
      isTyping: false,
      isLoading: false,

      initialize: initializeStore(set, get),
      ...createBasicActions(set),
      ...createConversationActions(set, get),
      ...createFolderActions(set),
      ...createFolderEnhancedActions(set, get),
      ...createWorkflowActions(set, get),
    } as unknown as ChatState), // ✅ Cast ici pour éviter l'erreur TypeScript
    {
      name: 'law-assistant-ui-prefs',
      version: 1,
      
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        activeFolderId: state.activeFolderId,
      }),
    }
  )
);

// Initialize the data when the store is created
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useChatStore.getState().initialize();
  }, 0);
}