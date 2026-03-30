import React, { useState, useRef, useEffect } from 'react';
import { Folder } from '@/store/types';
import { useChatStore } from '@/store/chatStore';
import { Button } from '@/components/ui/button';
import ChatSectionFolder from '../Sections/ChatSectionFolder';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { 
  MessageSquare, 
  Paperclip, 
  Clock, 
  FileText, 
  ArrowLeft,
  MoreVertical,
  Plus,
  Send,
  MessageCircle,
  Search,
  Save,
  Sparkles
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AttachmentList from './AttachmentList';
import TimelineView from './TimelineView';
import DocumentList from './DocumentList';
import { sendMessageWithStreaming, StreamStep } from '@/lib/streamingApi';
import type { LoadingStep } from '../Chat/ChatLoadingSteps';

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
    setActiveFolderId,
    isTyping,
    setIsTyping,
    deleteConversation,
    loadConversation
  } = useChatStore();
  
  const [activeTab, setActiveTab] = useState<'conversations' | 'attachments' | 'timeline' | 'documents'>('conversations');
  const [showConversationList, setShowConversationList] = useState(true);
  const [message, setMessage] = useState('');
  const [streamingSteps, setStreamingSteps] = useState<LoadingStep[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleOpenUpload = () => fileInputRef.current?.click();

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    toast.success(`${files.length} fichier(s) sélectionné(s)`);
  };

  // Créer une conversation et envoyer le premier message avec streaming
  const handleSendFirstMessage = async () => {
    const messageToSend = message.trim();
    if (!messageToSend || isTyping) return;

    console.log('🎬 [FOLDER-CHAT] Starting new chat in folder...', { 
      messageToSend, 
      folderId: folder.id 
    });

    // Vider le message AVANT de commencer
    setMessage('');
    
    setIsTyping(true);
    console.log('🔄 [FOLDER-CHAT] isTyping set to TRUE');
    
    setStreamingSteps([]);
    console.log('🧹 [FOLDER-CHAT] streamingSteps cleared');

    try {
      // Créer une conversation dans le dossier
      const newConvId = await createConversation(String(folder.id));
      if (!newConvId) {
        throw new Error('Failed to create conversation');
      }
      
      console.log('✅ [FOLDER-CHAT] Conversation created:', newConvId);

      // 🔄 ÉTAPE 1 : Switch vers la conversation AVANT le streaming
      setActiveConversationId(newConvId);
      setActiveFolderId(null);
      setShowConversationList(false);

      // 🔄 ÉTAPE 2 : Charger l'interface AVANT le streaming
      console.log('🔄 [FOLDER-CHAT] Loading conversation interface...');
      await loadConversation(newConvId);

      // ⏳ ÉTAPE 3 : Petite pause pour que l'utilisateur voie l'interface
      await new Promise(resolve => setTimeout(resolve, 200));

      // 📡 ÉTAPE 4 : Lancer le streaming (étapes apparaissent PAR-DESSUS)
      console.log('📡 [FOLDER-CHAT] Starting streaming with conversationId:', newConvId);

      await sendMessageWithStreaming(
        newConvId,
        messageToSend,
        (step: StreamStep) => {
          console.log('🔔 [FOLDER-CHAT] Step callback received:', step);
          
          const stepMap: Record<string, Partial<LoadingStep>> = {
            saving_user: { 
              id: 'save_user', 
              icon: <Save className="w-5 h-5" />, 
              message: 'Enregistrement de votre question...', 
              status: 'loading' 
            },
            searching: { 
              id: 'search', 
              icon: <Search className="w-5 h-5" />, 
              message: 'Recherche dans la base de connaissances...', 
              details: step.details,
              status: 'loading' 
            },
            documents_found: { 
              id: 'docs', 
              icon: <FileText className="w-5 h-5" />, 
              message: step.message || 'Documents trouvés', 
              details: step.details,
              status: 'complete' 
            },
            no_documents: { 
              id: 'docs', 
              icon: <FileText className="w-5 h-5" />, 
              message: 'Utilisation des connaissances générales',
              details: step.details,
              status: 'complete' 
            },
            rag_error: {
              id: 'docs',
              icon: <FileText className="w-5 h-5" />,
              message: step.message || 'Utilisation du modèle de base',
              status: 'complete'
            },
            generating: { 
              id: 'generate', 
              icon: <Sparkles className="w-5 h-5" />, 
              message: 'Génération de la réponse...', 
              details: step.details,
              status: 'loading' 
            },
            saving_timeline: {
              id: 'timeline',
              icon: <MessageSquare className="w-5 h-5" />,
              message: step.message || 'Création des événements...',
              status: 'loading'
            },
            saving_documents: {
              id: 'documents',
              icon: <FileText className="w-5 h-5" />,
              message: step.message || 'Création des documents...',
              status: 'loading'
            },
            complete: { 
              id: 'complete_step', 
              icon: <Sparkles className="w-5 h-5" />, 
              message: 'Réponse générée avec succès', 
              status: 'complete' 
            },
          };

          if (step.step && stepMap[step.step]) {
            console.log('✨ [FOLDER-CHAT] Mapping step to UI:', step.step);
            
            setStreamingSteps(prev => {
              const newStep = stepMap[step.step] as LoadingStep;
              const existing = prev.find(s => s.id === newStep.id);
              
              let updated;
              if (existing) {
                updated = prev.map(s => s.id === newStep.id ? { ...s, ...newStep } : s);
              } else {
                updated = [...prev, newStep];
              }
              
              console.log('📝 [FOLDER-CHAT] Updated steps:', updated.length);
              return updated;
            });
          }
        }
      );

      console.log('✅ [FOLDER-CHAT] Streaming complete!');

      // ⏳ ÉTAPE 4 : Attendre 300ms pour voir la dernière étape
      await new Promise(resolve => setTimeout(resolve, 300));

      // ✨ ÉTAPE 5 : Vider les étapes
      console.log('🧹 [FOLDER-CHAT] Clearing streaming steps...');
      setStreamingSteps([]);

      // 🔄 ÉTAPE 6 : Recharger pour avoir les nouveaux messages
      console.log('🔄 [FOLDER-CHAT] Reloading conversation with new messages...');
      await loadConversation(newConvId);
      
      console.log('✅ [FOLDER-CHAT] Conversation reloaded with new messages!');
      
    } catch (error: any) {
      console.error('❌ [FOLDER-CHAT] Error:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi du message');
    } finally {
      console.log('🏁 [FOLDER-CHAT] Finally block - setting isTyping to FALSE');
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Maj+Entrée : retour à la ligne (comportement par défaut)
    if (e.key === 'Enter' && e.shiftKey) {
      return;
    }
    
    // Entrée seule : envoyer le message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !isTyping) {
        handleSendFirstMessage();
      }
    }
  };

  const handleDeleteConversation = (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation(convId);
    toast.success('Conversation supprimée');
  };

  const tabs = [
    { id: 'conversations' as const, label: 'Conversations', icon: MessageCircle },
    { id: 'attachments' as const, label: 'Pièces jointes', icon: Paperclip },
    { id: 'timeline' as const, label: 'Chronologie', icon: Clock },
    { id: 'documents' as const, label: 'Documents', icon: FileText },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-200">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="rounded-full hover:bg-blue-950"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-start">
          <h1 className="text-xl font-semibold text-blue-950">{folder.name}</h1>
          {folder.description && (
            <p className="text-sm text-blue-950 mt-0.5">{folder.description}</p>
          )}
        </div>
        {/* Tabs Navigation */}
        <div className="flex-1 px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 my-3 py-3 text-sm font-medium border transition-colors relative",
                    isActive
                      ? "text-blue-950 border-blue-950 bg-white  hover:bg-blue-900 hover:text-white"
                      : "text-blue-950 border-transparent bg-white hover:bg-blue-900 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden pt-5 border-gray-200">
        {activeTab === 'conversations' && (
          <Card className="h-full flex flex-col border-none shadow-none max-w-4xl mx-auto">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {showConversationList && (
                <div className="h-full flex flex-col">
                  {/* Liste des conversations */}
                  <div className="flex-1 overflow-auto">
                    {folderConversations.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {folderConversations.map((conversation) => (
                          <div
                            key={conversation.id}
                            onClick={() => {
                              setActiveFolderId(null);
                              setActiveConversationId(conversation.id);
                            }}
                            className="group px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between"
                          >
                            <div className="min-w-0">
                              <h3 className="flex flex-start items-center text-sm font-medium text-blue-950 hover:text-blue-700 truncate flex-1">
                                <MessageCircle className="w-3 h-3 me-2" /> <span>{conversation.title}</span>
                              </h3>
                            </div>
                            
                            <Popover>
                              <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                >
                                  <MoreVertical className="w-4 h-4 text-gray-400" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-48 p-1" align="end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                                >
                                  Supprimer
                                </Button>
                              </PopoverContent>
                            </Popover>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center px-6">
                        <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="text-base font-medium text-gray-900 mb-2">
                          Aucune conversation
                        </h3>
                        <p className="text-sm text-gray-500">
                          Commencez une nouvelle conversation ci-dessous
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Champ de saisie en bas */}
                  <div className="p-6">
                    <div className="max-w-4xl mx-auto">
                      <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm hover:border-gray-300 transition-colors">
                        <textarea
                          ref={textareaRef}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Nouvelle conversation dans cette affaire..xxxxxxxxxxxxxxxxxxxxxxxxx."
                          rows={1}
                          className="w-full bg-transparent text-foreground placeholder-muted-foreground/70 outline-none text-base py-4 px-4 rounded-t-2xl border-0 resize-none overflow-auto focus:outline-none focus:ring-0"
                          onKeyDown={handleKeyDown}
                          disabled={isTyping}
                          style={{ 
                            minHeight: '56px',
                            maxHeight: '200px'
                          }}
                        />

                        {/* Buttons Bar */}
                        <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
                          {/* Upload Button */}
                          <div>
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
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                              aria-label="Uploader des éléments"
                            >
                              <Plus className="h-5 w-5" />
                            </Button>
                          </div>

                          {/* Send Button */}
                          <Button
                            onClick={handleSendFirstMessage}
                            size="icon"
                            className="h-9 w-9 rounded-lg bg-blue-950 hover:bg-blue-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isTyping || !message.trim()}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'attachments' && (
          <div className="h-full overflow-auto max-w-4xl mx-auto border-none shadow-none">
            <AttachmentList folderId={safeFolder.id} attachments={safeFolder.attachments} />
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="h-full overflow-auto max-w-4xl mx-auto border-none shadow-none">
            <TimelineView folderId={safeFolder.id} timeline={safeFolder.timeline} />
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="h-full overflow-auto max-w-4xl mx-auto border-none shadow-none">
            <DocumentList folderId={safeFolder.id} documents={safeFolder.documents} />
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderDetailView;