
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatState } from './types';
import { initializeStore, createBasicActions } from './storeInitialization';
import { createConversationActions } from './conversationActions';
import { createFolderActions } from './folderActions';
import { createFolderEnhancedActions } from './folderEnhancedActions';

// Export the AI simulation function
export { simulateAIResponse } from './aiSimulation';

// Export types
export type { Message, Conversation, Folder } from './types';

// Create the store with all actions
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

      // Initialize all store data
      initialize: initializeStore(set, get),
      
      // Basic actions
      ...createBasicActions(set),
      
      // Conversation actions
      ...createConversationActions(set, get),
      
      // Folder actions
      ...createFolderActions(set),
      
      // Enhanced folder actions
      ...createFolderEnhancedActions(set, get),
    }),
    {
      name: 'law-assistant-storage',
    }
  )
);

// Initialize the data when the store is created
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useChatStore.getState().initialize();
  }, 0);
}
