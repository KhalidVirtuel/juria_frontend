import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatLoadingSteps, { LoadingStep } from './ChatLoadingSteps';
import { Button } from '@/components/ui/button';
import { Send, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Message } from '@/store/types';
console.log('🚨🚨🚨 CHATCONTAINER.TSX LOADED 🚨🚨🚨'); // ✅ Ajoute cette ligne

interface ChatContainerProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: () => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  streamingSteps?: LoadingStep[];
}

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  messages, 
  isTyping,
  onSendMessage,
  inputValue,
  onInputChange,
  streamingSteps = []
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  console.log('🎨 [CONTAINER] Render - isTyping:', isTyping, 'steps:', streamingSteps.length);
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingSteps]);

  const handleOpenUpload = () => fileInputRef.current?.click();

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    toast.success(`${files.length} fichier(s) sélectionné(s)`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) return;
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isTyping) {
        console.log('⌨️ [CONTAINER] Enter key pressed, calling onSendMessage');
        onSendMessage();
      }
    }
  };

  const handleSend = () => {
    if (inputValue.trim() && !isTyping) {
      console.log('🖱️ [CONTAINER] Send button clicked, calling onSendMessage');
      onSendMessage();
    }
  };

  // ✅ Log avant le return pour éviter l'erreur TypeScript
  if (streamingSteps.length > 0) {
    console.log('✅ [CONTAINER] Will display ChatLoadingSteps');
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex-1 overflow-y-auto space-y-6 apple-scrollbar pt-16 pb-32">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {/* ✅ Affichage des étapes de recherche */}
        {isTyping && streamingSteps.length > 0 && (
          <ChatLoadingSteps steps={streamingSteps} />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">

                            <div className="relative liquid-glass-container">
                              
                              <div className="relative flex items-start gap-2 py-1 px-2">
                                 <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFilesSelected} />
                                <Button type="button" onClick={handleOpenUpload} size="icon" variant="ghost" className="h-10 w-10 flex-shrink-0 self-center text-foreground hover:text-primary hover:bg-muted/40">
                                  <Plus className="h-5 w-5" />
                                </Button>



                                <textarea
                                  ref={textareaRef}
                                                value={inputValue}
                                                onChange={(e) => onInputChange(e.target.value)}
                                                placeholder="Posez votre question..."
                                                rows={1}
                                                className="flex-1 bg-transparent text-foreground placeholder-muted-foreground/70 outline-none text-lg py-3 px-2 rounded-2xl border-0 resize-none overflow-hidden focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                                                onKeyDown={handleKeyDown}
                                                disabled={isTyping}
                                  style={{ minHeight: '44px', maxHeight: '200px', height: '50px'  }}
                                />

                              <Button onClick={handleSend} size="icon" className="h-10 w-10 flex-shrink-0 self-center rounded-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isTyping || !inputValue.trim()}>
                                  <Send className="h-4 w-4" />
                              </Button>
          
                              </div>
                            </div>

        </div>
      </div>
    </div>
  );
};

export default ChatContainer;