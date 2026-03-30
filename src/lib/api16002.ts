// src/lib/api.ts
import axios from "axios";

/** Base URL configurable (Vite) */
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787/api";

/** Axios instance */
const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
  headers: { "Content-Type": "application/json" },
});

/** Auth token interceptor */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** 401 -> logout */
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
    return Promise.reject(err);
  }
);

/* =========================
   ========  TYPES  ========
   ========================= */

export type ID = string | number;

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  lawFirm?: string;
  legalSpecialty?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message?: string;
  token: string;
  user?: User;
}

/** Front store Folder (mapping côté front fait ailleurs). */
export interface Attachment {
  id: string;
  folderId: string;
  name: string;
  type: "evidence" | "contract" | "document" | "other";
  url: string;
  size: number;
  uploadedAt: string | number;
}

export interface TimelineEntry {
  id: string;
  folderId: string;
  title: string;
  description?: string;
  type: "fact" | "procedure" | "hearing" | "deadline" | "event";
  date: string | number;
  createdAt: string | number;
}

export interface GeneratedDocument {
  id: string;
  folderId: string;
  title: string;
  type: "contract" | "conclusion" | "note" | "letter" | "report";
  content: string;
  createdAt: string | number;
  lastModified: string | number;
}

export interface Deadline {
  id: string;
  folderId: string;
  title: string;
  description?: string;
  dueDate: string | number;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "completed" | "overdue";
  createdAt: string | number;
}

export interface Folder {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  attachments?: Attachment[];
  timeline?: TimelineEntry[];
  documents?: GeneratedDocument[];
  deadlines?: Deadline[];
  conversations?: Conversation[];
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  folderId?: string | null;
  createdAt: string;
  updatedAt?: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  userId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}


export type AttachmentCreatePayload = {
  name: string;
  type: "evidence" | "contract" | "document" | "other";
  url?: string;
  size?: number;
};


/************TDO************** */
export interface AttachmentDTO {
  id: string | number;
  folderId: string | number;
  name: string;
  type: "evidence" | "contract" | "document" | "other"; // en minuscule
  url: string;
  size: number;
  uploadedAt: string; // ISO string renvoyée par l’API
}
/* =========================
   ========  AUTH  =========
   ========================= */

export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    lawFirm?: string;
    legalSpecialty?: string;
  }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/auth/register", {
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName,
      lawFirm: data.lawFirm,
      legalSpecialty: data.legalSpecialty,
    });
    return res.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    return res.data; // { token } — ensuite on peut fetch /auth/profile
  },

  profile: async (): Promise<{ user: User }> => {
    const res = await api.get<{ user: User }>("/auth/profile");
    return res.data;
  },

  updateProfile: async (data: Partial<User>): Promise<{ user: User }> => {
    const res = await api.put<{ user: User }>("/auth/profile", data);
    return res.data;
  },
};

/* =========================
   =======  FOLDERS  =======
   ========================= */

export const foldersAPI = {
  /** Liste de tous les dossiers de l’utilisateur (inclut leurs attachments/timeline/doc/deadlines). */
  getAll: async (): Promise<{ folders: Folder[] }> => {
    const res = await api.get<{ folders: Folder[] }>("/folders");
    return res.data;
  },

  /** Détail d’un dossier (inclut ses attachments… selon backend). */
  getById: async (id: ID): Promise<{ folder: Folder }> => {
    const res = await api.get<{ folder: Folder }>(`/folders/${id}`);
    return res.data;
  },

  /** Création dossier */
  create: async (data: { name: string; description?: string; color?: string }): Promise<{ folder: Folder }> => {
    const res = await api.post<{ folder: Folder }>("/folders", data);
    return res.data;
  },

  /** Update dossier (nom, couleur, description si supportée) */
  update: async (id: ID, data: Partial<Folder>): Promise<{ folder: Folder }> => {
    const res = await api.put<{ folder: Folder }>(`/folders/${id}`, data);
    return res.data;
  },

  /** Delete dossier (idempotent) */
  delete: async (id: ID): Promise<void> => {
    await api.delete(`/folders/${id}`);
  },

  // ---------- Attachments ----------
  /** Lister les pièces jointes du dossier */
  listAttachments: async (folderId: ID): Promise<{ attachments: Attachment[] }> => {
    const res = await api.get<{ attachments: Attachment[] }>(`/folders/${folderId}/attachments`);
    return res.data;
  },

  /** Ajouter une PJ en multipart (champ 'file'), + name/type facultatifs 
  uploadAttachment: async (
    folderId: ID,
    file: File,
    opts?: { name?: string; type?: "evidence" | "contract" | "document" | "other" }
  ): Promise<{ attachment: Attachment }> => {
    const form = new FormData();
    form.append("file", file);
    if (opts?.name) form.append("name", opts.name);
    if (opts?.type) form.append("type", opts.type);
    const res = await api.post<{ attachment: Attachment }>(`/folders/${folderId}/attachments`, form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
    return res.data;
  },*/

  /** Supprimer PJ 
  deleteAttachment: async (attachmentId: ID): Promise<void> => {
    await api.delete(`/folders/attachments/${attachmentId}`);
  },*/
  


  /** Ajoute une pièce jointe (JSON) */
  addAttachment: async (
    folderId: string,
    data: File | { name: string; type?: string; url?: string; size?: number }
  ): Promise<{ attachment: Attachment }> => {
    // si data est un File → multipart
    if (data instanceof File) {
      const fd = new FormData();
      fd.append('file', data);
      // tu peux aussi ajouter un type (contract/evidence/...) si besoin:
      // fd.append('type', 'contract');
      const r = await api.post(`/folders/${folderId}/attachments`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000, // ← pour les gros fichiers
      });
      return r.data;
    }
    // sinon JSON simple (l’endpoint supporte aussi JSON)
    const r = await api.post(`/folders/${folderId}/attachments`, data);
    return r.data;
  },


   // (optionnel) récupérer les PJ d’un dossier au rechargement
  getAttachments: async (folderId: string): Promise<{ attachments: Attachment[] }> => {
    const r = await api.get(`/folders/${folderId}/attachments`);
    return r.data;
  },

   /** Variante pour upload fichier (multipart) si tu en as besoin ailleurs */
  uploadAttachment: async (
    folderId: string | number,
    file: File,
    extras?: { name?: string; type?: AttachmentCreatePayload["type"] }
  ): Promise<{ attachment: AttachmentDTO }> => {
    const fd = new FormData();
    fd.append("file", file);
    if (extras?.name) fd.append("name", extras.name);
    if (extras?.type) fd.append("type", extras.type);
    const res = await api.post<{ attachment: AttachmentDTO }>(
      `/folders/${folderId}/attachments`,
      fd,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

/** Supprime une pièce jointe */
  deleteAttachment: async (attachmentId: string | number): Promise<void> => {
    await api.delete(`/folders/attachments/${attachmentId}`);
  },



  // ---------- Timeline ----------
  addTimelineEntry: async (
    folderId: ID,
    data: { title: string; description?: string; type: string; date: string }
  ): Promise<{ entry: TimelineEntry }> => {
    const res = await api.post<{ entry: TimelineEntry }>(`/folders/${folderId}/timeline`, data);
    console.log(data)
    return res.data;
  },

  deleteTimelineEntry: async (entryId: ID): Promise<void> => {
    await api.delete(`/folders/timeline/${entryId}`);
  },

  updateTimelineEntry: async (
  entryId: ID,
  data: { title?: string; description?: string; type?: string; date?: string; conversationId?: string | null }
): Promise<{ entry: TimelineEntry }> => {
  const res = await api.put<{ entry: TimelineEntry }>(`/folders/timeline/${entryId}`, data);
  return res.data;
},

  // ---------- Deadlines ----------
  addDeadline: async (
    folderId: ID,
    data: { title: string; description?: string; dueDate: string; priority: string }
  ): Promise<{ deadline: Deadline }> => {
    const res = await api.post<{ deadline: Deadline }>(`/folders/${folderId}/deadlines`, data);
    return res.data;
  },

  updateDeadlineStatus: async (deadlineId: ID, status: string): Promise<{ deadline: Deadline }> => {
    const res = await api.patch<{ deadline: Deadline }>(`/folders/deadlines/${deadlineId}/status`, { status });
    return res.data;
  },

  deleteDeadline: async (deadlineId: ID): Promise<void> => {
    await api.delete(`/folders/deadlines/${deadlineId}`);
  },

  // ---------- Documents générés ----------
  addDocument: async (
    folderId: ID,
    data: { title: string; type: string; content: string }
  ): Promise<{ document: GeneratedDocument }> => {
    const res = await api.post<{ document: GeneratedDocument }>(`/folders/${folderId}/documents`, data);
    return res.data;
  },

  updateDocument: async (
    documentId: ID,
    data: { title?: string; content?: string }
  ): Promise<{ document: GeneratedDocument }> => {
    const res = await api.put<{ document: GeneratedDocument }>(`/folders/documents/${documentId}`, data);
    return res.data;
  },

  deleteDocument: async (documentId: ID): Promise<void> => {
    await api.delete(`/folders/documents/${documentId}`);
  },
};

/* =========================
   ========= CHAT ==========
   ========================= */

export const chatAPI = {
  getConversations: async (folderId?: ID): Promise<{ conversations: Conversation[] }> => {
    const res = await api.get<{ conversations: Conversation[] }>("/chat/conversations", {
      params: folderId ? { folderId } : {},
    });
    return res.data;
  },

  getConversation: async (id: ID): Promise<{ conversation: Conversation }> => {
    const res = await api.get<{ conversation: Conversation }>(`/chat/conversations/${id}`);
    return res.data;
  },

  createConversation: async (data: { title: string; folderId?: ID | null }): Promise<{ conversation: Conversation }> => {
    const res = await api.post<{ conversation: Conversation }>("/chat/conversations", data);
    return res.data;
  },

  sendMessage: async (
    conversationId: ID,
    content: string
  ): Promise<{ userMessage: Message; assistantMessage: Message }> => {
    const res = await api.post<{ userMessage: Message; assistantMessage: Message }>(
      `/chat/conversations/${conversationId}/messages`,
      { content }
    );
    return res.data;
  },

  moveConversation: async (conversationId: ID, folderId: ID | null): Promise<{ conversation: Conversation }> => {
    const res = await api.patch<{ conversation: Conversation }>(`/chat/conversations/${conversationId}/move`, {
      folderId,
    });
    return res.data;
  },

  deleteConversation: async (id: ID): Promise<void> => {
    await api.delete(`/chat/conversations/${id}`);
  },
};

/* =========================
   ========== RAG ==========
   ========================= */

// --- Types RAG ---
// ✅ MISE À JOUR DU TYPE RagFile POUR SUPPORTER description
export type RagFile = {
  path: string;
  count: number;
  id?: number;
  name?: string;
  size?: number;
  url?: string;
  createdAt?: string;
  description?: string; // ✅ Ajouté
};

export type RagStats = {
  total: number;
  byPath: Array<{ path: string; count: number }>;
};

// --- Client RAG ---
export const ragAPI = {
  // Retourne { files: RagFile[] } depuis le backend
  list: async (): Promise<{ files: RagFile[] }> => {
    const r = await api.get('/rag/files');
    return r.data;
  },

  // Upload (si tu l’utilises)
   upload: async (file: File): Promise<{ file: RagFile }> => {
    const fd = new FormData();
    fd.append('file', file);
    const r = await api.post('/rag/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // ← 120s
    });
    return r.data;
  },

  // Supprime par id (si nécessaire)
  remove: async (name: string): Promise<{ ok: boolean }> => {
    const r = await api.delete(`/rag/files/${name}`);
    return r.data;
  },

  // Statistiques
  stats: async (): Promise<RagStats> => {
    const r = await api.get('/ragstat/stats');
    return r.data;
  },

  // Supprimer tous les chunks d’un fichier par son path
  deleteByPath: async (path: string): Promise<{ deleted: number }> => {
    const r = await api.post('/rag/delete-by-path', { path });
    return r.data;
  },

  // rebuild
  rebuild: async (): Promise<{ok:boolean; pid:number; logFile:string}> => {
    const r = await api.post('/rag/rebuild');
    return r.data;
  },
  listLogs: async (): Promise<{ok:boolean; logs:string[]}> => {
    const r = await api.get('/rag/rebuild/logs');
    return r.data;
  },
  getLog: async (name: string): Promise<string> => {
    const r = await api.get(`/rag/rebuild/logs/${encodeURIComponent(name)}`, { responseType: 'text' });
    return r.data;
  }
};




export const ragAdminAPI = {
  rebuild: async (): Promise<{ok:boolean; pid:number; logFile:string}> => {
    const r = await api.post('/rag/rebuild');
    return r.data;
  },
  listLogs: async (): Promise<{ok:boolean; logs:string[]}> => {
    const r = await api.get('/rag/rebuild/logs');
    return r.data;
  },
  getLog: async (name: string): Promise<string> => {
    const r = await api.get(`/rag/rebuild/logs/${encodeURIComponent(name)}`, { responseType: 'text' });
    return r.data;
  }
};


//Catalogue
export const catalogueAPI = {

  // ✅ NOUVELLE MÉTHODE : Upload avec nom et description
  uploadWithMetadata: async (file: File, name: string, description: string): Promise<{ file: RagFile }> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('name', name);
    fd.append('description', description);
    console.log("Uploading file with metadata:", name, description);
    const r = await api.post('/cataloguedata/upload-with-metadata', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    console.log(r.data)
    return r.data;
  },
  
  // ✅ NOUVELLE MÉTHODE : Liste avec métadonnées
  listWithMetadata: async (): Promise<{ files: RagFile[] }> => {
    const r = await api.get('/cataloguedata/files-with-metadata');
    return r.data;
  },
  
  // Méthodes existantes (list, upload, remove, stats)
  list: async (): Promise<{ files: RagFile[] }> => {
    const r = await api.get('/cataloguedata/files');
    return r.data;
  },

  upload: async (file: File, name: string, description: string): Promise<{ file: RagFile }> => {
    /*const fd = new FormData();
    fd.append('file', file);
    const r = await api.post('/cataloguedata/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return r.data;*/
    const fd = new FormData();
    fd.append('file', file);
    fd.append('name', name);
    fd.append('description', description);
    console.log("Uploading file with metadata:", name, description);
    const r = await api.post('/cataloguedata/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    
    return r.data;
  },

  remove: async (name: string): Promise<{ ok: boolean }> => {
    const r = await api.delete(`/cataloguedata/files/${name}`);
    return r.data;
  },


    removecatalogue: async (name: string): Promise<{ ok: boolean }> => {
    const r = await api.delete(`/cataloguedata/filescatalogue/${name}`);
    return r.data;
  },
  

  // Retourne { files: RagFile[] } depuis le backend
 /* list: async (): Promise<{ files: RagFile[] }> => {
    const r = await api.get('/catalogue/files');
    return r.data;
  },

  // Upload (si tu l’utilises)
   upload: async (file: File): Promise<{ file: RagFile }> => {
    const fd = new FormData();
    fd.append('file', file);
    const r = await api.post('/catalogue/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // ← 120s
    });
    return r.data;
  },

  // Supprime par id (si nécessaire)
  remove: async (name: string): Promise<{ ok: boolean }> => {
    alert(name)
    const r = await api.delete(`/catalogue/files/${name}`);
    console.log(r)
    return r.data;
  },
*/
  // Statistiques
  stats: async (): Promise<RagStats> => {
    const r = await api.get('/cataloguestat/stats');
    return r.data;
  },


  // Supprimer tous les chunks d’un fichier par son path
  deleteByPath: async (path: string): Promise<{ deleted: number }> => {
    const r = await api.post('/cataloguedata/delete-by-path', { path });
    return r.data;
  },

  // rebuildCat
  rebuildCat: async (): Promise<{ok:boolean; pid:number; logFile:string}> => {
    const r = await api.post('/catalogue/rebuildcat');
    console.log("rebuild started");
    console.log(r)
    return r.data;
  },

    // rebuildCatStat
  rebuildCatStat: async (): Promise<{ok:boolean; pid:number; type:string}> => {
    const r = await api.get('/catalogue/rebuildStatus');
    console.log("catalogue/rebuildStatus started");
    console.log(r)
    return r.data;
  },


    // rebuildDoc
  rebuildDoc: async (): Promise<{ok:boolean; pid:number; logFile:string}> => {
    const r = await api.post('/catalogue/rebuilddoc');
    console.log("rebuild started");
    console.log(r)
    return r.data;
  },

  listLogs: async (): Promise<{ok:boolean; logs:string[]}> => {
    const r = await api.get('/catalogue/rebuild/logs');
    return r.data;
  },
  getLog: async (name: string): Promise<string> => {
    const r = await api.get(`/catalogue/rebuild/logs/${encodeURIComponent(name)}`, { responseType: 'text' });
    return r.data;
  },


  // Dans catalogueAPI, AJOUTER
  getStatus: async (): Promise<{
      ok: boolean;
      isRunning: boolean;
      lastRun: {
        pid: number | null;
        startedAt: string;
        endedAt: string | null;
        code: number | null;
        success: boolean | null;
      }
    }> => {
      const r = await api.get('/catalogue/status');
      return r.data;
    },


    // Statut spécifique pour documents internes
getStatusDocument: async (): Promise<{
  ok: boolean;
  isRunning: boolean;
  lastRun: {
    pid: number | null;
    startedAt: string;
    endedAt: string | null;
    code: number | null;
    success: boolean | null;
  }
}> => {
  const r = await api.get('/catalogue/rebuildStatus?type=document');
  
  // Transformer la réponse pour avoir le même format que getStatus
  return {
    ok: true,
    isRunning: r.data.isRunning,
    lastRun: {
      pid: r.data.pid,
      startedAt: r.data.startedAt,
      endedAt: r.data.endedAt,
      code: r.data.code,
      success: r.data.ok,
    }
  };
}
};





//search

export type SearchContentResult = {
  filename: string;
  path: string;
  count: number;
  snippets: string[];
};

export type SearchContentResp = {
  liste_files: string[];
  results: SearchContentResult[];
};

export const searchAPI = {
  searchFiles: async (q: string, mode: 'phrase' | 'all' | 'any' = 'phrase'): Promise<SearchContentResp> => {
    const r = await api.post('/search/content', { q, mode });
    return r.data;
  },
};
export default api;