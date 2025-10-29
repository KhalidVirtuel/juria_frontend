
import { toast } from '@/components/ui/sonner';
import { ChatState, Folder, Conversation } from './types';
import { foldersAPI, chatAPI } from '@/lib/api';

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

// Helper function to convert backend conversation to store format
const convertConversation = (conv: any): Conversation => ({
  id: conv.id,
  title: conv.title,
  folderId: conv.folderId || null,
  createdAt: toTimestamp(conv.createdAt),
  lastUpdated: toTimestamp(conv.updatedAt),
  user_id: conv.userId,
  messages: (conv.messages || []).map((m: any) => ({
    id: m.id,
    content: m.content,
    role: m.role === 'USER' ? 'user' : 'assistant',
    timestamp: toTimestamp(m.createdAt),
    user_id: m.userId,
  })),
});

// Initialize the store by loading data from backend
export const initializeStore = (set: any, get: any) => async (): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    set({ isLoading: false });
    return;
  }

  set({ isLoading: true });

  try {
    // Load folders and conversations in parallel
    const [foldersResponse, conversationsResponse] = await Promise.all([
      foldersAPI.getAll(),
      chatAPI.getConversations(),
    ]);

    const folders = foldersResponse.folders.map(convertFolder);
    const conversations = conversationsResponse.conversations.map(convertConversation);

    set({
      folders,
      conversations,
      isLoading: false,
    });
  } catch (error: any) {
    console.error('Error initializing store:', error);
    // If unauthorized, token is invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ isLoading: false });
  }
};

// Basic state actions
export const createBasicActions = (set: any) => ({
  setActiveConversationId: (id: string | null) => {
    set({ activeConversationId: id });
  },
  
  setActiveFolderId: (id: string | null) => {
    set({ activeFolderId: id });
  },

  toggleSidebar: () => {
    set((state: ChatState) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setIsTyping: (value: boolean) => {
    set({ isTyping: value });
  },
});
