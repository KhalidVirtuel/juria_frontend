import React from 'react';
import type { Message } from '@/store/types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-8 py-5 mt-5`}>
      <div className="max-w-[70%] transition-all duration-200">
        <div className={`text-sm font-medium mb-2 ${isUser ? 'text-right text-mezin-ciel' : 'text-left text-primary'}`}>
          {isUser ? 'Vous' : 'Mizen AI'}
        </div>
        <div className={`p-4 rounded-2xl ${isUser ? ' bg-slate-100' : ''}`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
            {message.content}
          </p>
        </div>
        <div className={`text-xs opacity-60 mt-2 font-medium  ${isUser ? 'text-right text-mezin' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;