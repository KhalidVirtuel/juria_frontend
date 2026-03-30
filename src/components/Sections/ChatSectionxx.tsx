import React, { useState, useRef, useEffect } from 'react';
import { Plus, Send ,FolderPlus, Search, FileSignature} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ChatContainer from '../Chat/ChatContainer';
import ChatSectionFolder from '../Sections/ChatSectionFolder';
import { useChatStore } from '@/store/chatStore';

const ChatSection: React.FC = () => {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // ✅ Ajout ref pour textarea

  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    addMessage,
    createConversation,
    isTyping,
    setIsTyping,
  } = useChatStore();

  // Récupérer la conversation active
  const currentConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = currentConversation?.messages || [];
  
  // Vérifier si la conversation appartient à un dossier
  const isFromFolder = currentConversation?.folderId !== null && currentConversation?.folderId !== undefined;
  const folderId = currentConversation?.folderId;

  // ✅ Auto-resize du textarea
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

  const handleStartNewChat = async () => {
    const messageToSend = message.trim();
    if (!messageToSend) return;

    setIsTyping(true);

    try {
      let conversationId = activeConversationId;
      if (!conversationId) {
        conversationId = await createConversation();
        if (!conversationId) {
          throw new Error('Failed to create conversation');
        }
        setActiveConversationId(conversationId);
      }

      await addMessage(conversationId, 'user', messageToSend);
      setMessage('');

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi du message');
    } finally {
      setIsTyping(false);
    }
  };

  // ✅ Gestion des touches : Maj+Entrée vs Entrée
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Maj+Entrée : retour à la ligne (comportement par défaut)
    if (e.key === 'Enter' && e.shiftKey) {
      return;
    }
    
    // Entrée seule : envoyer le message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !isTyping) {
        handleStartNewChat();
      }
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="h-full">
      {/* Si la conversation appartient à un dossier, afficher ChatSectionFolder */}
      {isFromFolder && folderId ? (
        <ChatSectionFolder folderId={Number(folderId)} />
      ) : (
        // Sinon, afficher le chat normal
        <>
          {hasMessages && currentConversation ? (
            <div className="animate-fade-in">
              <ChatContainer
                messages={messages}
                isTyping={isTyping}
                onSendMessage={handleStartNewChat}
                inputValue={message}
                onInputChange={setMessage}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-8 bg-white animate-fade-in">
              <div className="w-full max-w-2xl mx-auto text-center">
                <div className="mb-16 flex flex-col items-center">
              <h1 className="text-5xl font-bold text-blue-950 mb-3">
                 Mizen
                <span className="inline-block font-medium transition-all text-blue-850 duration-300 hover:scale-105 ms-4" style={{ color: '#0187DA' }}>AI</span>
              </h1>
               <p className="font-light animate-fade-in" style={{ fontSize: '28px', color: '#6B7280', animationDelay: '0.3s', animationFillMode: 'backwards' }}>
                Votre assistant juridique intelligent
              </p>
            </div>
                {/* Premium Liquid Glass Search Bar */}
                <div className="relative max-w-3xl mx-auto mb-2">
                  <div className="relative liquid-glass-container">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/20 via-white/10 to-white/20 backdrop-blur-2xl"></div>
                    <div className="absolute inset-px rounded-3xl bg-gradient-to-b from-white/30 to-white/5 backdrop-blur-xl"></div>
                    <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"></div>

                    <div className="relative flex items-end gap-2 p-2">
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
                        className="h-10 w-10 flex-shrink-0 self-end text-foreground hover:text-primary hover:bg-muted/40"
                        aria-label="Uploader des éléments"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>

                      <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Maître, comment puis-je vous aider xxxxxxxxxxxxxx ?"
                        rows={1}
                        className="flex-1 bg-transparent text-foreground placeholder-muted-foreground/70 outline-none text-lg py-3 px-2 rounded-2xl border-0 resize-none overflow-hidden focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                        onKeyDown={handleKeyDown}
                        disabled={isTyping}
                        style={{ 
                          minHeight: '44px',
                          maxHeight: '200px'
                        }}
                      />

                      <Button
                        onClick={handleStartNewChat}
                        size="icon"
                        className="h-10 w-10 flex-shrink-0 self-end rounded-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        disabled={isTyping || !message.trim()}
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                 {/* Feature Cards */}
                            <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto mt-6">
                              <button className="flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105 group bg-white border border-gray-100">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 group-hover:from-blue-100 group-hover:to-blue-200 transition-all">
                                  <FolderPlus className="h-7 w-7" style={{ color: '#003878' }} />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                                  Nouveau Dossier
                                </span>
                              </button>
                
                              <button className="flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105 group bg-white border border-gray-100">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 group-hover:from-blue-100 group-hover:to-blue-200 transition-all">
                                  <Search className="h-7 w-7" style={{ color: '#003878' }} />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                                  Analyser
                                </span>
                              </button>
                
                              <button className="flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105 group bg-white border border-gray-100">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 group-hover:from-blue-100 group-hover:to-blue-200 transition-all">
                                  <FileSignature className="h-7 w-7" style={{ color: '#003878' }} />
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                                  Générer
                                </span>
                              </button>
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