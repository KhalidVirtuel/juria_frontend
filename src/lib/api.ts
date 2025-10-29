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

// Fonctions d'adaptation des données backend vers frontend
const adaptUserFromBackend = (backendUser: any): User => ({
  id: String(backendUser.id),
  email: backendUser.email,
  firstName: backendUser.firstName || '',
  lastName: backendUser.lastName || '',
  lawFirm: backendUser.firm || '',
  legalSpecialty: backendUser.specialty || '',
  createdAt: backendUser.createdAt,
  updatedAt: backendUser.createdAt, // Backend n'a pas updatedAt
});

const adaptFolderFromBackend = (backendFolder: any): Folder => ({
  id: String(backendFolder.id),
  userId: String(backendFolder.userId),
  name: backendFolder.name,
  description: '',
  color: '#3B82F6', // Couleur par défaut
  createdAt: backendFolder.createdAt,
  updatedAt: backendFolder.createdAt,
  attachments: [],
  timeline: [],
  documents: [],
  deadlines: [],
  conversations: [],
});

const adaptConversationFromBackend = (backendConv: any): Conversation => ({
  id: String(backendConv.id),
  userId: String(backendConv.userId),
  title: backendConv.title || 'Nouvelle conversation',
  folderId: backendConv.caseId ? String(backendConv.caseId) : undefined,
  createdAt: backendConv.createdAt,
  updatedAt: backendConv.createdAt,
  messages: backendConv.messages?.map((m: any) => adaptMessageFromBackend(m)) || [],
});

const adaptMessageFromBackend = (backendMsg: any): Message => ({
  id: String(backendMsg.id),
  conversationId: String(backendMsg.conversationId),
  userId: String(backendMsg.userId || ''),
  role: backendMsg.role.toUpperCase() as 'USER' | 'ASSISTANT',
  content: backendMsg.content,
  createdAt: backendMsg.createdAt,
});

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
    // Backend attend: first_name, last_name, email, password, firm, specialty
    // Backend retourne: { token }
    const backendData = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      password: data.password,
      firm: data.lawFirm || '',
      specialty: data.legalSpecialty || '',
    };
    const response = await api.post<{ token: string }>('/auth/register', backendData);

    // Récupérer le profil utilisateur après l'inscription
    const token = response.data.token;
    localStorage.setItem('token', token);

    const profileResponse = await api.get('/me/');
    const user = adaptUserFromBackend(profileResponse.data);

    return {
      message: 'Registration successful',
      user,
      token,
    };
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Backend retourne: { token }
    const response = await api.post<{ token: string }>('/auth/login', { email, password });

    // Récupérer le profil utilisateur après la connexion
    const token = response.data.token;
    localStorage.setItem('token', token);

    const profileResponse = await api.get('/me/');
    const user = adaptUserFromBackend(profileResponse.data);

    return {
      message: 'Login successful',
      user,
      token,
    };
  },

  getProfile: async (): Promise<{ user: User }> => {
    // Backend: GET /api/me/ retourne directement l'objet user
    const response = await api.get('/me/');
    const user = adaptUserFromBackend(response.data);
    return { user };
  },

  updateProfile: async (data: Partial<User>): Promise<{ user: User }> => {
    // ⚠️ ATTENTION: Cette route n'existe pas encore dans le backend
    // TODO: Implémenter PUT /api/me/ dans le backend
    const backendData = {
      first_name: data.firstName,
      last_name: data.lastName,
      firm: data.lawFirm,
      specialty: data.legalSpecialty,
    };
    const response = await api.put('/me/', backendData);
    const user = adaptUserFromBackend(response.data);
    return { user };
  },
};

// Folders
export const foldersAPI = {
  getAll: async (): Promise<{ folders: Folder[] }> => {
    // Backend: GET /api/folders retourne directement un array
    const response = await api.get<any[]>('/folders');
    const folders = response.data.map(adaptFolderFromBackend);
    return { folders };
  },

  getById: async (id: string): Promise<{ folder: Folder }> => {
    // ⚠️ ATTENTION: Cette route n'existe pas dans le backend
    // TODO: Implémenter GET /api/folders/:id dans le backend
    // Pour l'instant, on récupère tous les folders et on filtre
    const response = await api.get<any[]>('/folders');
    const backendFolder = response.data.find((f: any) => String(f.id) === id);
    if (!backendFolder) {
      throw new Error('Folder not found');
    }
    const folder = adaptFolderFromBackend(backendFolder);
    return { folder };
  },

  create: async (data: { name: string; description?: string; color?: string }): Promise<{ folder: Folder }> => {
    // Backend: POST /api/folders retourne { id: number }
    // Backend accepte uniquement { name: string }
    const response = await api.post<{ id: number }>('/folders', { name: data.name });

    // Créer un objet folder avec les données fournies
    const folder: Folder = {
      id: String(response.data.id),
      userId: '', // Sera rempli par le backend
      name: data.name,
      description: data.description || '',
      color: data.color || '#3B82F6',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
      timeline: [],
      documents: [],
      deadlines: [],
      conversations: [],
    };

    return { folder };
  },

  update: async (id: string, data: Partial<Folder>): Promise<{ folder: Folder }> => {
    // Backend: PATCH /api/folders/:id retourne { ok: true }
    // Backend accepte uniquement { name: string }
    await api.patch(`/folders/${id}`, { name: data.name });

    // Récupérer le folder mis à jour
    const response = await api.get<any[]>('/folders');
    const backendFolder = response.data.find((f: any) => String(f.id) === id);
    if (!backendFolder) {
      throw new Error('Folder not found after update');
    }

    const folder = adaptFolderFromBackend(backendFolder);
    return { folder };
  },

  delete: async (id: string): Promise<void> => {
    // Backend: DELETE /api/folders/:id retourne { ok: true }
    await api.delete(`/folders/${id}`);
  },

  // ⚠️ ATTENTION: Les routes ci-dessous n'existent pas encore dans le backend
  // TODO: Implémenter ces routes dans le backend pour activer ces fonctionnalités

  // Attachments
  addAttachment: async (
    folderId: string,
    data: { name: string; type: string; url: string; size: number }
  ): Promise<{ attachment: Attachment }> => {
    // ❌ Route non implémentée: POST /api/folders/:id/attachments
    const response = await api.post<{ attachment: Attachment }>(`/folders/${folderId}/attachments`, data);
    return response.data;
  },

  deleteAttachment: async (attachmentId: string): Promise<void> => {
    // ❌ Route non implémentée: DELETE /api/folders/attachments/:id
    await api.delete(`/folders/attachments/${attachmentId}`);
  },

  // Timeline
  addTimelineEntry: async (
    folderId: string,
    data: { title: string; description: string; type: string; date: string }
  ): Promise<{ entry: TimelineEntry }> => {
    // ❌ Route non implémentée: POST /api/folders/:id/timeline
    const response = await api.post<{ entry: TimelineEntry }>(`/folders/${folderId}/timeline`, data);
    return response.data;
  },

  deleteTimelineEntry: async (entryId: string): Promise<void> => {
    // ❌ Route non implémentée: DELETE /api/folders/timeline/:id
    await api.delete(`/folders/timeline/${entryId}`);
  },

  // Deadlines
  addDeadline: async (
    folderId: string,
    data: { title: string; description: string; dueDate: string; priority: string }
  ): Promise<{ deadline: Deadline }> => {
    // ❌ Route non implémentée: POST /api/folders/:id/deadlines
    const response = await api.post<{ deadline: Deadline }>(`/folders/${folderId}/deadlines`, data);
    return response.data;
  },

  updateDeadlineStatus: async (deadlineId: string, status: string): Promise<{ deadline: Deadline }> => {
    // ❌ Route non implémentée: PATCH /api/folders/deadlines/:id/status
    const response = await api.patch<{ deadline: Deadline }>(`/folders/deadlines/${deadlineId}/status`, { status });
    return response.data;
  },

  deleteDeadline: async (deadlineId: string): Promise<void> => {
    // ❌ Route non implémentée: DELETE /api/folders/deadlines/:id
    await api.delete(`/folders/deadlines/${deadlineId}`);
  },

  // Documents
  addDocument: async (
    folderId: string,
    data: { title: string; type: string; content: string }
  ): Promise<{ document: GeneratedDocument }> => {
    // ❌ Route non implémentée: POST /api/folders/:id/documents
    const response = await api.post<{ document: GeneratedDocument }>(`/folders/${folderId}/documents`, data);
    return response.data;
  },

  updateDocument: async (
    documentId: string,
    data: { title?: string; content?: string }
  ): Promise<{ document: GeneratedDocument }> => {
    // ❌ Route non implémentée: PUT /api/folders/documents/:id
    const response = await api.put<{ document: GeneratedDocument }>(`/folders/documents/${documentId}`, data);
    return response.data;
  },

  deleteDocument: async (documentId: string): Promise<void> => {
    // ❌ Route non implémentée: DELETE /api/folders/documents/:id
    await api.delete(`/folders/documents/${documentId}`);
  },
};

// Chat - Backend utilise /conversations au lieu de /chat/conversations
export const chatAPI = {
  getConversations: async (folderId?: string): Promise<{ conversations: Conversation[] }> => {
    // Backend: GET /api/conversations retourne directement un array
    const response = await api.get<any[]>('/conversations');
    let conversations = response.data.map(adaptConversationFromBackend);

    // Filtrer par folderId si fourni (côté client pour l'instant)
    if (folderId) {
      conversations = conversations.filter((c) => c.folderId === folderId);
    }

    return { conversations };
  },

  getConversation: async (id: string): Promise<{ conversation: Conversation }> => {
    // Backend: GET /api/conversations/:id/messages retourne directement un array de messages
    const messagesResponse = await api.get<any[]>(`/conversations/${id}/messages`);
    const messages = messagesResponse.data.map(adaptMessageFromBackend);

    // Récupérer aussi les infos de la conversation
    const conversationsResponse = await api.get<any[]>('/conversations');
    const backendConv = conversationsResponse.data.find((c: any) => String(c.id) === id);

    if (!backendConv) {
      throw new Error('Conversation not found');
    }

    const conversation = adaptConversationFromBackend(backendConv);
    conversation.messages = messages;

    return { conversation };
  },

  createConversation: async (data: { title: string; folderId?: string }): Promise<{ conversation: Conversation }> => {
    // Backend: POST /api/conversations retourne { id: number }
    // Backend utilise folder_id au lieu de folderId
    const backendData = {
      title: data.title,
      folder_id: data.folderId ? parseInt(data.folderId) : undefined,
    };
    const response = await api.post<{ id: number }>('/conversations', backendData);

    // Créer un objet conversation
    const conversation: Conversation = {
      id: String(response.data.id),
      userId: '', // Sera rempli automatiquement
      title: data.title,
      folderId: data.folderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    return { conversation };
  },

  sendMessage: async (
    conversationId: string,
    content: string
  ): Promise<{ userMessage: Message; assistantMessage: Message }> => {
    // Backend: POST /api/conversations/:id/message (singulier)
    // Backend attend { role: "user"|"assistant", content: string }
    // Backend retourne { reply: string, answer: string }
    const response = await api.post<{ reply: string; answer: string }>(
      `/conversations/${conversationId}/message`,
      { role: 'user', content }
    );

    // Créer les objets messages
    const userMessage: Message = {
      id: `temp-user-${Date.now()}`,
      conversationId,
      userId: '',
      role: 'USER',
      content,
      createdAt: new Date().toISOString(),
    };

    const assistantMessage: Message = {
      id: `temp-assistant-${Date.now()}`,
      conversationId,
      userId: '',
      role: 'ASSISTANT',
      content: response.data.answer || response.data.reply,
      createdAt: new Date().toISOString(),
    };

    return { userMessage, assistantMessage };
  },

  moveConversation: async (conversationId: string, folderId: string | null): Promise<{ conversation: Conversation }> => {
    // ⚠️ Le backend ne supporte peut-être pas folder_id dans PATCH
    // La méthode POST /conversations crée un FolderItem, mais PATCH ne le gère pas
    // TODO: Vérifier si le backend supporte cette fonctionnalité

    // Pour l'instant, on va simplement récupérer la conversation sans modification
    const conversationsResponse = await api.get<any[]>('/conversations');
    const backendConv = conversationsResponse.data.find((c: any) => String(c.id) === conversationId);

    if (!backendConv) {
      throw new Error('Conversation not found');
    }

    const conversation = adaptConversationFromBackend(backendConv);
    return { conversation };
  },

  deleteConversation: async (id: string): Promise<void> => {
    // Backend: DELETE /api/conversations/:id retourne { ok: true }
    await api.delete(`/conversations/${id}`);
  },
};
