import React from 'react';
import { Message } from '@/hooks/useConversations';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-8`}>
      <div className="max-w-[70%] transition-all duration-200">
        <div className={`text-sm font-medium mb-2 ${isUser ? 'text-right text-blue-600' : 'text-left text-primary'}`}>
          {isUser ? 'Vous' : 'Jure AI'}
        </div>
        <div className={`p-4 rounded-2xl ${isUser ? 'bg-blue-50' : 'bg-muted/30'}`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
            {message.content}
          </p>
        </div>
        <div className={`text-xs opacity-60 mt-2 font-medium text-muted-foreground ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.created_at)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;