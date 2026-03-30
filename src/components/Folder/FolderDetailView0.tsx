import React, { useState, useEffect } from 'react';
import { Folder, Message } from '@/store/types';
import { useChatStore } from '@/store/chatStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Paperclip, 
  Clock, 
  FileText, 
  Calendar, 
  Plus,
  ArrowLeft
} from 'lucide-react';
import ConversationItem from '../Sidebar/ConversationItem';
import AttachmentList from './AttachmentList';
import TimelineView from './TimelineView';
import DocumentList from './DocumentList';
import DeadlineList from './DeadlineList';
import ChatContainer from '../Chat/ChatContainer';
import api from '@/lib/api';

interface FolderDetailViewProps {
  folder: Folder;
  onBack: () => void;
}

// ✅ Type pour les messages avec conversationId
interface ChatMessage extends Message {
  conversationId?: string;
}

const FolderDetailView: React.FC<FolderDetailViewProps> = ({ folder, onBack }) => {
  const { conversations, createConversation } = useChatStore();
  const [activeTab, setActiveTab] = useState('conversations');
  
  // États pour le chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const folderConversations = conversations.filter(conv => conv.folderId === folder.id);

  const safeFolder = {
    ...folder,
    attachments: folder.attachments || [],
    timeline: folder.timeline || [],
    documents: folder.documents || [],
    deadlines: folder.deadlines || []
  };

  useEffect(() => {
    if (folder?.id) {
      loadOrCreateFolderConversation();
    }
  }, [folder?.id]);

  // ✅ Fonction pour convertir les messages du backend vers le format frontend
  const formatBackendMessage = (msg: any): ChatMessage => {
    return {
      id: msg.id || String(msg.id),
      content: msg.content,
      role: msg.role.toLowerCase() as 'user' | 'assistant',
      timestamp: msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now(),
      user_id: msg.userId || msg.user_id,
      conversationId: msg.conversationId,
    };
  };

  const loadOrCreateFolderConversation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/chat/conversations?folderId=${folder.id}`);
      const data = response.data;
      
      if (data.conversations && data.conversations.length > 0) {
        const conv = data.conversations[0];
        setCurrentConversation(conv);
        
        // ✅ Convertir les messages du backend
        const formattedMessages = (conv.messages || []).map(formatBackendMessage);
        setMessages(formattedMessages);
      } else {
        await createNewConversation();
      }
    } catch (error: any) {
      console.error('Erreur loadOrCreateFolderConversation:', error);
      setError(error.response?.data?.error || error.message || 'Erreur de chargement');
      try {
        await createNewConversation();
      } catch (createError) {
        console.error('Impossible de créer la conversation:', createError);
      }
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await api.post('/chat/conversations', {
        title: `Chat - ${folder.name}`,
        folderId: folder.id,
      });
      const data = response.data;
      
      setCurrentConversation(data.conversation);
      setMessages([]);
      setError(null);
    } catch (error: any) {
      console.error('Erreur createNewConversation:', error);
      setError(error.response?.data?.error || error.message || 'Erreur de création');
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentConversation || isTyping) return;

    const userMessageContent = messageInput.trim();
    
    // ✅ Créer un message temporaire avec le bon format
    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId: currentConversation.id,
      user_id: 'current-user',
      role: 'user',
      content: userMessageContent,
      timestamp: Date.now(), // ✅ timestamp au lieu de createdAt
    };
    
    setMessages(prev => [...prev, tempUserMessage]);
    setMessageInput('');
    setIsTyping(true);

    try {
      const response = await api.post(
        `/chat/conversations/${currentConversation.id}/messages`,
        { content: userMessageContent }
      );
      const data = response.data;

      // ✅ Convertir les messages du backend
      const formattedUserMessage = formatBackendMessage(data.userMessage);
      const formattedAssistantMessage = formatBackendMessage(data.assistantMessage);

      // Remplacer le message temporaire
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempUserMessage.id);
        return [...filtered, formattedUserMessage, formattedAssistantMessage];
      });

      setError(null);
      
    } catch (error: any) {
      console.error('Erreur handleSendMessage:', error);
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
      setError(error.response?.data?.error || error.message || 'Erreur d\'envoi');
    } finally {
      setIsTyping(false);
    }
  };

  const handleCreateConversation = () => {
    createConversation(folder.id);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-foreground">{folder.name}</h1>
          {folder.description && (
            <p className="text-sm text-muted-foreground mt-1">{folder.description}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-5 mx-4 mt-4">
            <TabsTrigger value="conversations" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Conversations
            </TabsTrigger>
            <TabsTrigger value="attachments" className="flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Pièces jointes
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Chronologie
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="deadlines" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Échéances
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden p-4">
            <TabsContent value="conversations" className="h-full mt-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg">Chat du dossier</CardTitle>
                  {currentConversation && (
                    <Badge variant="secondary">
                      {messages.length} message{messages.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent className="flex-1 overflow-hidden p-0">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mb-4 animate-pulse" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Chargement du chat...
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Veuillez patienter
                      </p>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <MessageSquare className="w-12 h-12 text-destructive mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Erreur de connexion
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {error}
                      </p>
                      <Button onClick={loadOrCreateFolderConversation} variant="outline">
                        Réessayer
                      </Button>
                    </div>
                  ) : currentConversation ? (
                    <div className="h-full">
                      <ChatContainer
                        messages={messages as Message[]}
                        isTyping={isTyping}
                        onSendMessage={handleSendMessage}
                        inputValue={messageInput}
                        onInputChange={setMessageInput}
                      />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attachments" className="h-full mt-0">
              <AttachmentList folderId={safeFolder.id} attachments={safeFolder.attachments} />
            </TabsContent>

            <TabsContent value="timeline" className="h-full mt-0">
              <TimelineView folderId={safeFolder.id} timeline={safeFolder.timeline} />
            </TabsContent>

            <TabsContent value="documents" className="h-full mt-0">
              <DocumentList folderId={safeFolder.id} documents={safeFolder.documents} />
            </TabsContent>

            <TabsContent value="deadlines" className="h-full mt-0">
              <DeadlineList folderId={safeFolder.id} deadlines={safeFolder.deadlines} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default FolderDetailView;