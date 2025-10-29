import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import { Message } from '@/hooks/useConversations';
import { Button } from '@/components/ui/button';
import { Send, Plus } from 'lucide-react';

interface ChatContainerProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: () => void;
  inputValue: string;
  onInputChange: (value: string) => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  messages, 
  isTyping,
  onSendMessage,
  inputValue,
  onInputChange 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 apple-scrollbar pt-16 pb-32">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isTyping && (
          <div className="flex justify-start px-8">
            <div className="rounded-2xl p-4 max-w-xs">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full animate-pulse delay-150"></div>
                </div>
                <span className="text-foreground/70 text-sm font-medium">L'IA réfléchit...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative liquid-glass-container">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 via-white/10 to-white/20 backdrop-blur-2xl"></div>
            <div className="absolute inset-px rounded-full bg-gradient-to-b from-white/30 to-white/5 backdrop-blur-xl"></div>
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"></div>

            <div className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="Posez votre question..."
                className="relative w-full pl-6 py-4 pr-16 bg-transparent text-foreground placeholder-muted-foreground/70 outline-none text-lg rounded-full border-0 backdrop-blur-xl focus:outline-none focus:ring-0 focus:border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputValue.trim() && !isTyping) {
                    onSendMessage();
                  }
                }}
                disabled={isTyping}
              />
              <Button
                onClick={onSendMessage}
                size="sm"
                className="absolute right-2 h-8 w-8 p-0 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={isTyping || !inputValue.trim()}
              >
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