import React, { useState, useRef } from 'react';
import { Plus, Scale, Calendar, Send, FolderPlus, Search, FileSignature } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ChatContainer from '../Chat/ChatContainer';
import { useChatStore } from '@/store/chatStore';

const ChatSection: React.FC = () => {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    setActiveFolderId,
    addMessage,
    createConversation,
    isTyping,
    setIsTyping,
  } = useChatStore();

  // Get current conversation and its messages
  const currentConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = currentConversation?.messages || [];

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
      // Clear folder view to show chat
      setActiveFolderId(null);

      // Create new conversation if needed
      let conversationId = activeConversationId;
      if (!conversationId) {
        conversationId = await createConversation();
        if (!conversationId) {
          throw new Error('Failed to create conversation');
        }
        setActiveConversationId(conversationId);
      }

      // Send message (this will add both user and assistant messages)
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
    </div>
  );
};

export default ChatSection;
