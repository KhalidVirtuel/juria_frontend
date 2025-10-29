
import { ChatState } from './types';
import { toast } from '@/hooks/use-toast';
import { chatAPI } from '@/lib/api';

// Helper function to convert backend date strings to timestamps
const toTimestamp = (dateStr: string): number => new Date(dateStr).getTime();

export const createConversationActions = (set: any, get: any) => ({
  addMessage: async (conversationId: string, role: 'user' | 'assistant', content: string): Promise<void> => {
    try {
      // Only handle user messages - assistant messages come from backend
      if (role === 'user') {
        // Send message to backend and get both user message and AI response
        const { userMessage, assistantMessage } = await chatAPI.sendMessage(conversationId, content);

        // Update local state with both messages
        set((state: ChatState) => ({
          conversations: state.conversations.map((convo) => {
            if (convo.id === conversationId) {
              return {
                ...convo,
                lastUpdated: toTimestamp(assistantMessage.createdAt),
                messages: [
                  ...convo.messages,
                  {
                    id: userMessage.id,
                    content: userMessage.content,
                    role: 'user' as const,
                    timestamp: toTimestamp(userMessage.createdAt),
                  },
                  {
                    id: assistantMessage.id,
                    content: assistantMessage.content,
                    role: 'assistant' as const,
                    timestamp: toTimestamp(assistantMessage.createdAt),
                  },
                ],
              };
            }
            return convo;
          }),
        }));

        // Auto-rename conversation if this is the first user message
        const conversation = get().conversations.find((c: any) => c.id === conversationId);
        if (conversation && conversation.title === 'Nouvelle conversation') {
          const newTitle = content.length > 50
            ? `${content.substring(0, 50)}...`
            : content;
          get().updateConversationTitle(conversationId, newTitle);
        }
      }
    } catch (error: any) {
      console.error('Error adding message:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Une erreur est survenue lors de l'envoi du message.",
        variant: "destructive"
      });
    }
  },

  createConversation: async (folderId: string | null = null): Promise<string> => {
    try {
      // Create conversation on backend
      const { conversation } = await chatAPI.createConversation({
        title: 'Nouvelle conversation',
        folderId: folderId || undefined,
      });

      // Add to local state
      set((state: ChatState) => ({
        conversations: [
          {
            id: conversation.id,
            title: conversation.title,
            messages: [],
            folderId: conversation.folderId || null,
            lastUpdated: toTimestamp(conversation.updatedAt),
            createdAt: toTimestamp(conversation.createdAt),
            user_id: conversation.userId,
          },
          ...state.conversations,
        ],
        activeConversationId: conversation.id,
      }));

      return conversation.id;
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Une erreur est survenue lors de la création de la conversation.",
        variant: "destructive"
      });
      return '';
    }
  },

  updateConversationTitle: async (id: string, title: string): Promise<void> => {
    try {
      // Update local state first (optimistic update)
      set((state: ChatState) => ({
        conversations: state.conversations.map((convo) => {
          if (convo.id === id) {
            return { ...convo, title };
          }
          return convo;
        }),
      }));

      // Note: Backend doesn't have a specific endpoint for updating title
      // Title is auto-generated from first message
      // If we need to update manually, we can add this to the backend later
    } catch (error) {
      console.error('Error updating conversation title:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du titre.",
        variant: "destructive"
      });
    }
  },

  deleteConversation: async (id: string): Promise<void> => {
    try {
      // Delete from backend
      await chatAPI.deleteConversation(id);

      // Update local state
      set((state: ChatState) => {
        const newConversations = state.conversations.filter((c) => c.id !== id);
        const newActiveId = state.activeConversationId === id
          ? (newConversations[0]?.id || null)
          : state.activeConversationId;

        return {
          conversations: newConversations,
          activeConversationId: newActiveId,
        };
      });

      toast({
        title: "Succès",
        description: "Conversation supprimée avec succès"
      });
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Une erreur est survenue lors de la suppression de la conversation.",
        variant: "destructive"
      });
    }
  },

  moveConversationToFolder: async (conversationId: string, folderId: string | null): Promise<void> => {
    try {
      // Move on backend
      await chatAPI.moveConversation(conversationId, folderId);

      // Update local state
      set((state: ChatState) => ({
        conversations: state.conversations.map((convo) => {
          if (convo.id === conversationId) {
            return { ...convo, folderId };
          }
          return convo;
        }),
      }));

      // Show a success message
      const folder = folderId
        ? get().folders.find((f: { id: string }) => f.id === folderId)?.name
        : 'Conversations';

      if (folder) {
        toast({
          title: "Succès",
          description: `Conversation déplacée dans "${folder}"`
        });
      }
    } catch (error: any) {
      console.error('Error moving conversation to folder:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Une erreur est survenue lors du déplacement de la conversation.",
        variant: "destructive"
      });
    }
  },
});
