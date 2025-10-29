import React, { useState, useRef, useEffect } from 'react';
import { Plus, Scale, Users, Calendar, Send, FileText } from 'lucide-react';
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
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="h-full">
      {hasMessages && currentConversation ? (
        <div className="animate-fade-in">
          <ChatContainer
            messages={messages.map((m) => ({
              id: m.id,
              conversation_id: currentConversation.id,
              role: m.role === 'USER' ? 'user' : 'assistant',
              content: m.content,
              created_at: new Date(m.timestamp).toISOString(),
            }))}
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
              <h1 className="text-6xl font-onest text-accent mb-2" style={{ letterSpacing: '-5%' }}>
                <span className="font-bold">Jure</span> <span className="font-medium">AI</span>
              </h1>
              <p className="text-lg text-muted-foreground font-light">
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
            <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
              <Card className="transition-transform duration-200 hover:scale-[1.01] bg-transparent border-0 shadow-none">
                <CardContent className="p-6 text-center">
                  <div className="mb-3 flex justify-center">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Rédaction Automatique</h3>
                  <p className="text-sm text-muted-foreground">Générez des documents juridiques en quelques clics</p>
                </CardContent>
              </Card>

              <Card className="transition-transform duration-200 hover:scale-[1.01] bg-transparent border-0 shadow-none">
                <CardContent className="p-6 text-center">
                  <div className="mb-3 flex justify-center">
                    <Scale className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Analyse Juridique</h3>
                  <p className="text-sm text-muted-foreground">Analysez vos dossiers avec l'IA juridique</p>
                </CardContent>
              </Card>

              <Card className="transition-transform duration-200 hover:scale-[1.01] bg-transparent border-0 shadow-none">
                <CardContent className="p-6 text-center">
                  <div className="mb-3 flex justify-center">
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Gestion Clients</h3>
                  <p className="text-sm text-muted-foreground">Organisez et suivez vos clients efficacement</p>
                </CardContent>
              </Card>

              <Card className="transition-transform duration-200 hover:scale-[1.01] bg-transparent border-0 shadow-none">
                <CardContent className="p-6 text-center">
                  <div className="mb-3 flex justify-center">
                    <Calendar className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Planning Intelligent</h3>
                  <p className="text-sm text-muted-foreground">Planifiez vos audiences et rendez-vous</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSection;
