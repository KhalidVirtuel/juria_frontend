// This hook is deprecated - use useChatStore instead
// Kept for compatibility with existing components

export const useConversations = () => {
  // This hook is no longer used - useChatStore from Zustand handles all conversation operations
  // Returning empty defaults for compatibility
  return {
    conversations: [],
    loading: false,
    createConversation: async () => null,
    deleteConversation: async () => {},
    loadConversations: async () => {},
  };
};
