import React, { useState, useRef, useEffect } from 'react';
import { Plus, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ChatContainer from '../Chat/ChatContainer';
import { useChatStore } from '@/store/chatStore';

interface ChatSectionFolderProps {
  folderId: number;
}

const ChatSectionFolder: React.FC<ChatSectionFolderProps> = ({ folderId }) => {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    addMessage,
    createConversation,
    isTyping,
    setIsTyping,
  } = useChatStore();

  // ✅ Récupérer la conversation active
  const currentConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = currentConversation?.messages || [];

  // ✅ Créer automatiquement une conversation si aucune n'est active
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
        } else {
          // Créer une nouvelle conversation pour ce dossier
          const newConvId = await createConversation(String(folderId));
          if (newConvId) {
            setActiveConversationId(newConvId);
          }
        }
      }
    };

    initConversation();
  }, [folderId, activeConversationId, conversations, setActiveConversationId, createConversation]);

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
        conversationId = await createConversation(String(folderId));
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

  const hasMessages = messages.length > 0;

  return (
    <div className="h-full">
      {hasMessages && currentConversation ? (
        <div className="animate-fade-in h-full">
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