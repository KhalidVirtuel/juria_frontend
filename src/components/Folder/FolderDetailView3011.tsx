import React, { useState, useRef } from 'react';
import { Folder } from '@/store/types';
import { useChatStore } from '@/store/chatStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ChatSectionFolder from '../Sections/ChatSectionFolder';
import { toast } from 'sonner';

import { 
  MessageSquare, 
  Paperclip, 
  Clock, 
  FileText, 
  Calendar, 
  Plus,
  ArrowLeft,
  List,
  Send
} from 'lucide-react';
import ConversationItem from '../Sidebar/ConversationItem';
import AttachmentList from './AttachmentList';
import TimelineView from './TimelineView';
import DocumentList from './DocumentList';
import DeadlineList from './DeadlineList';

interface FolderDetailViewProps {
  folder: Folder;
  onBack: () => void;
}

const FolderDetailView: React.FC<FolderDetailViewProps> = ({ folder, onBack }) => {
  const { 
    conversations, 
    createConversation,
    activeConversationId,
    setActiveConversationId,
    addMessage,
    isTyping,
    setIsTyping
  } = useChatStore();
  
  const [activeTab, setActiveTab] = useState('conversations');
  const [showConversationList, setShowConversationList] = useState(true);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filtrer les conversations du dossier
  const folderConversations = conversations.filter(
    conv => String(conv.folderId) === String(folder.id)
  );

  // Vérifier si on a une conversation active du dossier
  const activeConversation = conversations.find(
    c => c.id === activeConversationId && String(c.folderId) === String(folder.id)
  );

  const safeFolder = {
    ...folder,
    attachments: folder.attachments || [],
    timeline: folder.timeline || [],
    documents: folder.documents || [],
    deadlines: folder.deadlines || []
  };

  // ✅ Créer une conversation et envoyer le premier message
  const handleSendFirstMessage = async () => {
    const messageToSend = message.trim();
    if (!messageToSend || isTyping) return;

    setIsTyping(true);

    try {
      // Créer la conversation
      const newConvId = await createConversation(String(folder.id));
      if (!newConvId) {
        throw new Error('Failed to create conversation');
      }
      
      // Activer la conversation
      setActiveConversationId(newConvId);
      
      // Envoyer le message
      await addMessage(newConvId, 'user', messageToSend);
      
      // Basculer vers la vue chat
      setShowConversationList(false);
      setMessage('');
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi du message');
    } finally {
      setIsTyping(false);
    }
  };

  // Retourner à la liste des conversations
  const handleBackToList = () => {
    setShowConversationList(true);
    setActiveConversationId(null);
  };

  const handleOpenUpload = () => fileInputRef.current?.click();

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    toast.success(`${files.length} fichier(s) sélectionné(s)`);
  };

  return (
    <div className="h-full flex flex-col bg-background">

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">


                {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-2">
          <h1 className="text-xl font-semibold text-foreground">{folder.name}</h1>
          {folder.description && (
            <p className="text-sm text-muted-foreground mt-1">{folder.description}</p>
          )}
        </div>
        <div className="flex-2">
          <TabsList className="grid w-full grid-cols-5 mx-4 bg-white">
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
           
           {
            /**
             <TabsTrigger value="deadlines" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Échéances
            </TabsTrigger>
             */
           }
            


          </TabsList>
        </div>
      </div>


          <div className="flex-1 overflow-hidden p-4">
            <TabsContent value="conversations" className="h-full mt-0">
              <Card className="h-full flex flex-col">
                {/* Header dynamique selon l'état */}
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-2">
                    {!showConversationList && activeConversation && (
                      <Button variant="ghost" size="sm" onClick={handleBackToList}>
                        <List className="w-4 h-4" />
                      </Button>
                    )}
                    <CardTitle className="text-lg">
                      {showConversationList 
                        ? 'Conversations du dossier' 
                        : activeConversation?.title || 'Chat'}
                    </CardTitle>
                    {showConversationList && (
                      <Badge variant="secondary">
                        {folderConversations.length}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                {/* Contenu conditionnel : Liste OU Chat */}
                <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                  {showConversationList ? (
                    // ✅ Liste des conversations + Champ de saisie permanent
                    <>
                      {/* Liste des conversations */}
                      <div className="flex-1 overflow-auto p-4">
                        {folderConversations.length > 0 ? (
                          <div className="space-y-2">
                            {folderConversations.map((conversation) => (
                              <div
                                key={conversation.id}
                                onClick={() => {
                                  setActiveConversationId(conversation.id);
                                  setShowConversationList(false);
                                }}
                              >
                                <ConversationItem conversation={conversation} />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center pb-20">
                            <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                              Aucune conversation
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Commencez une nouvelle conversation ci-dessous
                            </p>
                          </div>
                        )}
                      </div>

                      {/* ✅ Champ de saisie permanent en bas */}
                      <div className="border-t border-border p-4 bg-background">
                        <div className="relative max-w-3xl mx-auto">
                          <div className="relative liquid-glass-container">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 via-white/10 to-white/20 backdrop-blur-2xl"></div>
                            <div className="absolute inset-px rounded-full bg-gradient-to-b from-white/30 to-white/5 backdrop-blur-xl"></div>
                            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"></div>

                            <div className="relative flex items-center">
                              <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                multiple
                                onChange={handleFilesSelected}
                              />
                              <Button
                                type="button"
                                onClick={handleOpenUpload}
                                size="sm"
                                variant="ghost"
                                className="absolute left-2 h-8 w-8 p-0 text-foreground hover:text-primary hover:bg-muted/40 z-10"
                                aria-label="Uploader des éléments"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Maître, comment puis-je vous aider ?"
                                className="relative w-full pl-12 py-4 pr-16 bg-transparent text-foreground placeholder-muted-foreground/70 outline-none text-lg rounded-full border-0 backdrop-blur-xl focus:outline-none focus:ring-0 focus:border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && message.trim() && !isTyping) {
                                    handleSendFirstMessage();
                                  }
                                }}
                                disabled={isTyping}
                              />
                              <Button
                                onClick={handleSendFirstMessage}
                                size="sm"
                                className="absolute right-2 h-8 w-8 p-0 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground"
                                disabled={isTyping || !message.trim()}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Afficher le chat avec ChatSectionFolder
                    <div className="h-full">
                      <ChatSectionFolder folderId={Number(folder.id)} />
                    </div>
                  )}
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

{
                /*
              <TabsContent value="deadlines" className="h-full mt-0">
                            <DeadlineList folderId={safeFolder.id} deadlines={safeFolder.deadlines} />
                          </TabsContent>
                */
              }
            
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default FolderDetailView;