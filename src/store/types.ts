
// Common types used across the chat store

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  user_id?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  folderId: string | null;
  lastUpdated: number;
  createdAt: number;
  user_id?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'evidence' | 'contract' | 'document' | 'other';
  url: string;
  size: number;
  uploadedAt: number;
  folderId: string;
}

export interface TimelineEntry {
  id: string;
  title: string;
  description: string;
  type: 'fact' | 'procedure' | 'hearing' | 'deadline' | 'event';
  date: number;
  folderId: string;
  createdAt: number;
}

export interface GeneratedDocument {
  id: string;
  title: string;
  type: 'contract' | 'conclusion' | 'note' | 'letter' | 'report';
  content: string;
  folderId: string;
  createdAt: number;
  lastModified: number;
}

export interface Deadline {
  id: string;
  title: string;
  description: string;
  dueDate: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'overdue';
  folderId: string;
  createdAt: number;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: number;
  user_id?: string;
  // Intelligent folder features
  attachments: Attachment[];
  timeline: TimelineEntry[];
  documents: GeneratedDocument[];
  deadlines: Deadline[];
}

export interface ChatState {
  conversations: Conversation[];
  folders: Folder[];
  activeConversationId: string | null;
  activeFolderId: string | null;
  sidebarOpen: boolean;
  isTyping: boolean;
  isLoading: boolean;
  
  // Actions will be implemented in separate files
  initialize: () => Promise<void>;
  setActiveConversationId: (id: string | null) => void;
  setActiveFolderId: (id: string | null) => void;
  addMessage: (conversationId: string, role: 'user' | 'assistant', content: string) => Promise<void>;
  createConversation: (folderId?: string | null) => Promise<string>;
  updateConversationTitle: (id: string, title: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  moveConversationToFolder: (conversationId: string, folderId: string | null) => Promise<void>;
  createFolder: (name: string, description?: string, color?: string) => Promise<string>;
  updateFolderName: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  // Attachment actions
  addAttachment: (folderId: string, attachment: Omit<Attachment, 'id' | 'folderId' | 'uploadedAt'>) => Promise<void>;
  removeAttachment: (folderId: string, attachmentId: string) => Promise<void>;
  // Timeline actions
  addTimelineEntry: (folderId: string, entry: Omit<TimelineEntry, 'id' | 'folderId' | 'createdAt'>) => Promise<void>;
  updateTimelineEntry: (folderId: string, entryId: string, updates: Partial<TimelineEntry>) => Promise<void>;
  removeTimelineEntry: (folderId: string, entryId: string) => Promise<void>;
  // Document actions
  addDocument: (folderId: string, document: Omit<GeneratedDocument, 'id' | 'folderId' | 'createdAt' | 'lastModified'>) => Promise<void>;
  updateDocument: (folderId: string, documentId: string, updates: Partial<GeneratedDocument>) => Promise<void>;
  removeDocument: (folderId: string, documentId: string) => Promise<void>;
  // Deadline actions
  addDeadline: (folderId: string, deadline: Omit<Deadline, 'id' | 'folderId' | 'createdAt'>) => Promise<void>;
  updateDeadline: (folderId: string, deadlineId: string, updates: Partial<Deadline>) => Promise<void>;
  removeDeadline: (folderId: string, deadlineId: string) => Promise<void>;
  toggleSidebar: () => void;
  setIsTyping: (value: boolean) => void;
}
