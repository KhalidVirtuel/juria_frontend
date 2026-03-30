import React, { useState, useRef, useEffect,useCallback } from 'react';
import { Plus, Send, Search, FileText, MessageSquare, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ChatContainer from '../Chat/ChatContainer';
import { useChatStore } from '@/store/chatStore';
import { sendMessageWithStreaming, StreamStep } from '@/lib/streamingApi';
import type { LoadingStep } from '../Chat/ChatLoadingSteps';

interface ChatSectionFolderProps {
  folderId: number;
  streamingSteps?: LoadingStep[];
  externalOptimisticMessage?: string | null;
  onTypingComplete?: () => void; // ✅ Nouveau prop
}

const ChatSectionFolder: React.FC<ChatSectionFolderProps> = ({ 
  folderId, 
  streamingSteps: externalStreamingSteps = [],
  externalOptimisticMessage = null,
  onTypingComplete: externalOnTypingComplete // ✅ Récupère le callback externe
}) => {
  const [message, setMessage] = useState('');
  const [streamingSteps, setStreamingSteps] = useState<LoadingStep[]>([]);
  const [optimisticMessage, setOptimisticMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    isTyping,
    setIsTyping,
    loadConversation,
  } = useChatStore();

  // Récupérer la conversation active
  const currentConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = currentConversation?.messages || [];

  // 🆕 Utiliser le message optimiste externe (depuis FolderDetailView) ou local
  const activeOptimisticMessage = externalOptimisticMessage || optimisticMessage;
  
  // 🆕 Ajouter le message optimiste si présent
  const displayMessages = activeOptimisticMessage 
    ? [...messages, { 
        id: 'optimistic',
        conversationId: activeConversationId || '',
        content: activeOptimisticMessage, 
        role: 'user' as const,
        createdAt: new Date().toISOString(),
        timestamp: Date.now(),
        sources: []
      }]
    : messages;

      const handleTypingComplete = useCallback(() => {
        console.log('✅ [FOLDER-SECTION] Typing animation complete, setting isTyping to false');
        setIsTyping(false);
        // ✅ Appelle aussi le callback externe si fourni (depuis FolderDetailView)
        externalOnTypingComplete?.();
      }, [setIsTyping, externalOnTypingComplete]);

  // Créer automatiquement une conversation si aucune n'est active
  useEffect(() => {
    const initConversation = async () => {
      if (!activeConversationId) {
        // Chercher une conversation existante du dossier
        const folderConversations = conversations.filter(
          c => String(c.folderId) === String(folderId)
        );
        
        if (folderConversations.length > 0) {
          // Activer la première conversation du dossier
          setActiveConversationId(folderConversations[0].id);
        }
      }
    };

    initConversation();
  }, [folderId, activeConversationId, conversations, setActiveConversationId]);

  const handleOpenUpload = () => fileInputRef.current?.click();

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    toast.success(`${files.length} fichier(s) sélectionné(s)`);
  };

  const handleStartNewChat = async () => {
    const messageToSend = message.trim();
    if (!messageToSend) return;

    console.log('🎬 [FOLDER-SECTION] Starting new chat...', { 
      messageToSend, 
      folderId,
      conversationId: activeConversationId
    });

    // Vider le message AVANT de commencer
    setMessage('');
    
    // 🆕 Afficher le message utilisateur IMMÉDIATEMENT
    setOptimisticMessage(messageToSend);
    
    setIsTyping(true);
    console.log('🔄 [FOLDER-SECTION] isTyping set to TRUE');
    
    setStreamingSteps([]);
    console.log('🧹 [FOLDER-SECTION] streamingSteps cleared');

    try {
      let conversationId = activeConversationId;
      
      // 📨 ÉTAPE 1 : Créer conversation si nécessaire
      if (!conversationId) {
        conversationId = await createConversation(String(folderId));
        if (!conversationId) {
          throw new Error('Failed to create conversation');
        }
        setActiveConversationId(conversationId);
      }

      console.log('✅ [FOLDER-SECTION] Conversation ID:', conversationId);

      // 🔄 ÉTAPE 2 : Charger l'interface AVANT le streaming
      console.log('🔄 [FOLDER-SECTION] Loading conversation interface...');
      await loadConversation(conversationId);

      // ⏳ ÉTAPE 3 : Petite pause pour que l'utilisateur voie l'interface
      await new Promise(resolve => setTimeout(resolve, 200));

      // 📡 ÉTAPE 4 : Lancer le streaming (étapes apparaissent PAR-DESSUS)
      console.log('📡 [FOLDER-SECTION] Starting streaming with conversationId:', conversationId);

      await sendMessageWithStreaming(
        conversationId,
        messageToSend,
        (step: StreamStep) => {
          console.log('🔔 [FOLDER-SECTION] Step callback received:', step);
          
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
            console.log('✨ [FOLDER-SECTION] Mapping step to UI:', step.step, '→', stepMap[step.step]);
            
            setStreamingSteps(prev => {
              const newStep = stepMap[step.step] as LoadingStep;
              const existing = prev.find(s => s.id === newStep.id);
              
              let updated;
              if (existing) {
                updated = prev.map(s => s.id === newStep.id ? { ...s, ...newStep } : s);
              } else {
                updated = [...prev, newStep];
              }
              
              console.log('📝 [FOLDER-SECTION] Updated steps:', updated.length, updated);
              return updated;
            });
          }
        }
      );

      console.log('✅ [FOLDER-SECTION] Streaming complete!');

      // ⏳ ÉTAPE 5 : Attendre 300ms pour voir la dernière étape
      await new Promise(resolve => setTimeout(resolve, 300));

      // ✨ ÉTAPE 6 : Vider les étapes
      console.log('🧹 [FOLDER-SECTION] Clearing streaming steps...');
      setStreamingSteps([]);

      // 🔄 ÉTAPE 7 : Recharger pour avoir les nouveaux messages
      console.log('🔄 [FOLDER-SECTION] Reloading conversation with new messages...');
      await loadConversation(conversationId);
      
      // 🧹 Nettoyer le message optimiste
      setOptimisticMessage(null);
      
      console.log('✅ [FOLDER-SECTION] Conversation reloaded with new messages!');
      
      // ✅ NE met PAS setIsTyping(false) ici !
      // Le callback handleTypingComplete le fera après l'animation

    } catch (error: any) {
      console.error('❌ [FOLDER-SECTION] Error:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi du message');
      setOptimisticMessage(null);
      setIsTyping(false); // ✅ Seulement en cas d'erreur
    }
    // ✅ PAS de finally avec setIsTyping(false) !
  };

  const hasMessages = messages.length > 0;

  // Utiliser les steps externes si fournis, sinon les locaux
  const activeSteps = externalStreamingSteps.length > 0 ? externalStreamingSteps : streamingSteps;
  
  // 🔍 DEBUG
  console.log('🔍 [FOLDER-SECTION] externalStreamingSteps:', externalStreamingSteps.length);
  console.log('🔍 [FOLDER-SECTION] streamingSteps (local):', streamingSteps.length);
  console.log('🔍 [FOLDER-SECTION] activeSteps (final):', activeSteps.length);

  return (
    <div className="h-full">
      {hasMessages || activeConversationId || activeOptimisticMessage ? (
        <div className="animate-fade-in h-full">
        

           <ChatContainer
                          messages={displayMessages}
                          isTyping={isTyping}
                          onSendMessage={handleStartNewChat} 
                          inputValue={message}
                          onInputChange={setMessage}
                          streamingSteps={streamingSteps}
                          onTypingComplete={handleTypingComplete}
                        />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full px-8 bg-white animate-fade-in">
          <div className="w-full max-w-2xl mx-auto text-center">
            <div className="relative max-w-3xl mx-auto mb-2">
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
                        handleStartNewChat();
                      }
                    }}
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleStartNewChat}
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
        </div>
      )}
    </div>
  );
};

export default ChatSectionFolder;