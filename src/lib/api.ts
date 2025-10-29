import axios from 'axios';

// Configuration de l'API
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';

// Instance Axios configurée
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 secondes
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  lawFirm?: string;
  legalSpecialty?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];
  timeline?: TimelineEntry[];
  documents?: GeneratedDocument[];
  deadlines?: Deadline[];
  conversations?: Conversation[];
}

export interface Attachment {
  id: string;
  folderId: string;
  name: string;
  type: 'EVIDENCE' | 'CONTRACT' | 'DOCUMENT' | 'OTHER';
  url: string;
  size: number;
  uploadedAt: string;
}

export interface TimelineEntry {
  id: string;
  folderId: string;
  title: string;
  description: string;
  type: 'FACT' | 'PROCEDURE' | 'HEARING' | 'DEADLINE' | 'EVENT';
  date: string;
  createdAt: string;
}

export interface GeneratedDocument {
  id: string;
  folderId: string;
  title: string;
  type: 'CONTRACT' | 'CONCLUSION' | 'NOTE' | 'LETTER' | 'REPORT';
  content: string;
  createdAt: string;
  lastModified: string;
}

export interface Deadline {
  id: string;
  folderId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  folderId?: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  userId: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

// API Methods

// Auth
export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    lawFirm?: string;
    legalSpecialty?: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<{ user: User }> => {
    const response = await api.put<{ user: User }>('/auth/profile', data);
    return response.data;
  },
};

// Folders
export const foldersAPI = {
  getAll: async (): Promise<{ folders: Folder[] }> => {
    const response = await api.get<{ folders: Folder[] }>('/folders');
    return response.data;
  },

  getById: async (id: string): Promise<{ folder: Folder }> => {
    const response = await api.get<{ folder: Folder }>(`/folders/${id}`);
    return response.data;
  },

  create: async (data: { name: string; description?: string; color?: string }): Promise<{ folder: Folder }> => {
    const response = await api.post<{ folder: Folder }>('/folders', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Folder>): Promise<{ folder: Folder }> => {
    const response = await api.put<{ folder: Folder }>(`/folders/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/folders/${id}`);
  },

  // Attachments
  addAttachment: async (
    folderId: string,
    data: { name: string; type: string; url: string; size: number }
  ): Promise<{ attachment: Attachment }> => {
    const response = await api.post<{ attachment: Attachment }>(`/folders/${folderId}/attachments`, data);
    return response.data;
  },

  deleteAttachment: async (attachmentId: string): Promise<void> => {
    await api.delete(`/folders/attachments/${attachmentId}`);
  },

  // Timeline
  addTimelineEntry: async (
    folderId: string,
    data: { title: string; description: string; type: string; date: string }
  ): Promise<{ entry: TimelineEntry }> => {
    const response = await api.post<{ entry: TimelineEntry }>(`/folders/${folderId}/timeline`, data);
    return response.data;
  },

  deleteTimelineEntry: async (entryId: string): Promise<void> => {
    await api.delete(`/folders/timeline/${entryId}`);
  },

  // Deadlines
  addDeadline: async (
    folderId: string,
    data: { title: string; description: string; dueDate: string; priority: string }
  ): Promise<{ deadline: Deadline }> => {
    const response = await api.post<{ deadline: Deadline }>(`/folders/${folderId}/deadlines`, data);
    return response.data;
  },

  updateDeadlineStatus: async (deadlineId: string, status: string): Promise<{ deadline: Deadline }> => {
    const response = await api.patch<{ deadline: Deadline }>(`/folders/deadlines/${deadlineId}/status`, { status });
    return response.data;
  },

  deleteDeadline: async (deadlineId: string): Promise<void> => {
    await api.delete(`/folders/deadlines/${deadlineId}`);
  },

  // Documents
  addDocument: async (
    folderId: string,
    data: { title: string; type: string; content: string }
  ): Promise<{ document: GeneratedDocument }> => {
    const response = await api.post<{ document: GeneratedDocument }>(`/folders/${folderId}/documents`, data);
    return response.data;
  },

  updateDocument: async (
    documentId: string,
    data: { title?: string; content?: string }
  ): Promise<{ document: GeneratedDocument }> => {
    const response = await api.put<{ document: GeneratedDocument }>(`/folders/documents/${documentId}`, data);
    return response.data;
  },

  deleteDocument: async (documentId: string): Promise<void> => {
    await api.delete(`/folders/documents/${documentId}`);
  },
};

// Chat
export const chatAPI = {
  getConversations: async (folderId?: string): Promise<{ conversations: Conversation[] }> => {
    const params = folderId ? { folderId } : {};
    const response = await api.get<{ conversations: Conversation[] }>('/chat/conversations', { params });
    return response.data;
  },

  getConversation: async (id: string): Promise<{ conversation: Conversation }> => {
    const response = await api.get<{ conversation: Conversation }>(`/chat/conversations/${id}`);
    return response.data;
  },

  createConversation: async (data: { title: string; folderId?: string }): Promise<{ conversation: Conversation }> => {
    const response = await api.post<{ conversation: Conversation }>('/chat/conversations', data);
    return response.data;
  },

  sendMessage: async (
    conversationId: string,
    content: string
  ): Promise<{ userMessage: Message; assistantMessage: Message }> => {
    const response = await api.post<{ userMessage: Message; assistantMessage: Message }>(
      `/chat/conversations/${conversationId}/messages`,
      { content }
    );
    return response.data;
  },

  moveConversation: async (conversationId: string, folderId: string | null): Promise<{ conversation: Conversation }> => {
    const response = await api.patch<{ conversation: Conversation }>(`/chat/conversations/${conversationId}/move`, {
      folderId,
    });
    return response.data;
  },

  deleteConversation: async (id: string): Promise<void> => {
    await api.delete(`/chat/conversations/${id}`);
  },
};
