import { useMemo } from 'react';
import { useChatStore } from '@/store/chatStore';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  conversation_id: string;
}

export interface Conversation {
  id: string;
  title: string;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export const useConversations = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    setActiveFolderId,
    createConversation: createConversationAction,
    deleteConversation: deleteConversationAction,
    moveConversationToFolder: moveConversationToFolderAction,
    updateConversationTitle,
  } = useChatStore();

  const formattedConversations = useMemo<Conversation[]>(
    () =>
      conversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        folder_id: conversation.folderId,
        created_at: new Date(conversation.createdAt).toISOString(),
        updated_at: new Date(conversation.lastUpdated).toISOString(),
        messages: conversation.messages.map((message) => ({
          id: message.id,
          content: message.content,
          role: message.role,
          created_at: new Date(message.timestamp).toISOString(),
          conversation_id: conversation.id,
        })),
      })),
    [conversations]
  );

  const currentConversation = useMemo(
    () => formattedConversations.find((conversation) => conversation.id === activeConversationId) || null,
    [formattedConversations, activeConversationId]
  );

  const selectConversation = (conversation: Conversation) => {
    setActiveConversationId(conversation.id);
    setActiveFolderId(null);
  };

  const createConversation = async (title?: string) => {
    const conversationId = await createConversationAction(null);

    if (conversationId) {
      setActiveConversationId(conversationId);

      if (title && title.trim() && title.trim() !== 'Nouvelle conversation') {
        await updateConversationTitle(conversationId, title.trim());
      }
    }

    return conversationId;
  };

  const deleteConversation = async (id: string) => {
    await deleteConversationAction(id);
  };

  const moveConversationToFolder = async (conversationId: string, folderId: string | null) => {
    await moveConversationToFolderAction(conversationId, folderId);
  };

  return {
    conversations: formattedConversations,
    currentConversation,
    loading: false,
    selectConversation,
    createConversation,
    deleteConversation,
    moveConversationToFolder,
  };
};
