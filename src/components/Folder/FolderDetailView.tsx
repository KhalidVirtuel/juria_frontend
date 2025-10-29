import React, { useState } from 'react';
import { Folder } from '@/store/types';
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

interface FolderDetailViewProps {
  folder: Folder;
  onBack: () => void;
}

const FolderDetailView: React.FC<FolderDetailViewProps> = ({ folder, onBack }) => {
  const { conversations, createConversation } = useChatStore();
  const [activeTab, setActiveTab] = useState('conversations');
  
  const folderConversations = conversations.filter(conv => conv.folderId === folder.id);

  // Ensure folder properties are initialized
  const safeFolder = {
    ...folder,
    attachments: folder.attachments || [],
    timeline: folder.timeline || [],
    documents: folder.documents || [],
    deadlines: folder.deadlines || []
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
                  <CardTitle className="text-lg">Conversations du dossier</CardTitle>
                  <Button onClick={handleCreateConversation} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle conversation
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                  {folderConversations.length > 0 ? (
                    <div className="space-y-2">
                      {folderConversations.map((conversation) => (
                        <ConversationItem key={conversation.id} conversation={conversation} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">Aucune conversation</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Commencez une nouvelle conversation pour ce dossier
                      </p>
                      <Button onClick={handleCreateConversation}>
                        <Plus className="w-4 h-4 mr-2" />
                        Créer une conversation
                      </Button>
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