import React, { useState, useRef, useEffect } from 'react';
import { Plus, Send, Search, FileText, MessageSquare, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ChatContainer from './ChatContainer';
import ChatSectionFolder from '../Sections/ChatSectionFolder';
import { useChatStore } from '@/store/chatStore';
import { sendMessageWithStreaming, StreamStep } from '@/lib/streamingApi';
import type { LoadingStep } from './ChatLoadingSteps';
console.log('🚨🚨🚨 CHATSECTION.TSX LOADED 🚨🚨🚨'); // ✅ Ajoute cette ligne

const ChatSection: React.FC = () => {
    console.log('🔵 CHATSECTION COMPONENT RENDERING'); // ✅ ET CELLE-CI AUSSI

  const [message, setMessage] = useState('');
  const [streamingSteps, setStreamingSteps] = useState<LoadingStep[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    isTyping,
    setIsTyping,
    loadConversation,
  } = useChatStore();

  const currentConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = currentConversation?.messages || [];
  
  const isFromFolder = currentConversation?.folderId !== null && currentConversation?.folderId !== undefined;
  const folderId = currentConversation?.folderId;

  useEffect(() => {
       setIsTyping(false);
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

  // ✅ UNE SEULE fonction pour envoyer les messages


const handleStartNewChat = async () => {
  const messageToSend = message.trim();
  if (!messageToSend) return;

  console.log('🎬 [CHAT] Starting new chat...', { messageToSend });
  
  // ✅ Vider le message ICI, avant de commencer
  setMessage('');
  
  setIsTyping(true);
  console.log('🔄 [CHAT] isTyping set to TRUE');
  
  setStreamingSteps([]);
  console.log('🧹 [CHAT] streamingSteps cleared');

  try {
    let conversationId = activeConversationId;
    if (!conversationId) {
      conversationId = await createConversation();
      if (!conversationId) {
        throw new Error('Failed to create conversation');
      }
      setActiveConversationId(conversationId);
    }

    console.log('📡 [CHAT] Calling sendMessageWithStreaming with conversationId:', conversationId);

       await sendMessageWithStreaming(
        conversationId,
        messageToSend,
        (step: StreamStep) => {
          console.log('🔔 [CHAT] Step callback received:', step);
          
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
            console.log('✨ [CHAT] Mapping step to UI:', step.step, '→', stepMap[step.step]);
            
            setStreamingSteps(prev => {
              const newStep = stepMap[step.step] as LoadingStep;
              const existing = prev.find(s => s.id === newStep.id);
              
              console.log('📊 [CHAT] Previous steps:', prev.length);
              console.log('🆕 [CHAT] New step:', newStep);
              
              let updated;
              if (existing) {
                updated = prev.map(s => s.id === newStep.id ? { ...s, ...newStep } : s);
              } else {
                updated = [...prev, newStep];
              }
              
              console.log('📝 [CHAT] Updated steps:', updated.length, updated);
              return updated;
            });
          }
        }
      );

    console.log('✅ [CHAT] Streaming complete, loading conversation...');
    await loadConversation(conversationId);

  } catch (error: any) {
    console.error('❌ [CHAT] Error:', error);
    toast.error(error.message || 'Erreur lors de l\'envoi du message');
  } finally {
    console.log('🏁 [CHAT] Finally block - setting isTyping to FALSE');
    setIsTyping(false);
    setTimeout(() => {
      console.log('🧹 [CHAT] Clearing steps after 500ms');
      setStreamingSteps([]);
    }, 500);
  }
};






  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) return;
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !isTyping) {
        console.log('⌨️ [CHAT] Enter key pressed, calling handleStartNewChat');
        handleStartNewChat();
      }
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="h-full">
      {isFromFolder && folderId ? (
        <ChatSectionFolder folderId={Number(folderId)} />
      ) : (
        <>
          {hasMessages && currentConversation ? (
            <div className="animate-fade-in">
              <ChatContainer
                messages={messages}
                isTyping={isTyping}
                onSendMessage={handleStartNewChat} 
                inputValue={message}
                onInputChange={setMessage}
                streamingSteps={streamingSteps}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-8 bg-white animate-fade-in">
              <div className="w-full max-w-2xl mx-auto text-center">
                <div className="relative max-w-3xl mx-auto mb-2">
                  <div className="relative liquid-glass-container">
                    <div className="relative flex items-start gap-2 p-2 pt-0 ">
                      <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFilesSelected} />
                      <Button 
                        type="button" 
                        onClick={handleOpenUpload} 
                        size="icon" 
                        variant="ghost" 
                        className="h-10 w-10 flex-shrink-0 self-end text-foreground hover:text-primary hover:bg-muted/40"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>

                      <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Maître, comment puis-je vous aider ? Chatsection"
                        rows={1}
                        className="flex-1 bg-transparent text-foreground placeholder-muted-foreground/70 outline-none text-lg py-3 px-2 rounded-2xl border-0 resize-none overflow-hidden focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                        onKeyDown={handleKeyDown}
                        disabled={isTyping}
                        style={{ minHeight: '44px', maxHeight: '200px' }}
                      />

                      <Button 
                        onClick={() => {
                          console.log('🖱️ [CHAT] Send button clicked');
                          handleStartNewChat();
                        }}
                        size="icon" 
                        className="h-10 w-10 flex-shrink-0 self-end rounded-full bg-accent hover:bg-accent/90 text-accent-foreground" 
                        disabled={isTyping || !message.trim()}
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatSection;