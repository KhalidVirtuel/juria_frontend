import React, { useState, useEffect, useRef } from 'react';
import type { Message } from '@/store/types';

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
  isStreaming?: boolean;
  typingSpeed?: 'slow' | 'normal' | 'fast' | 'instant';
  onTypingComplete?: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isLatest = false, 
  isStreaming = false,
  typingSpeed = 'fast',
  onTypingComplete
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const currentIndexRef = useRef(0);
  const hasCalledCallback = useRef(false); // ✅ Empêche les appels multiples

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUser = message.role === 'user';

  const speeds = {
    slow: 50,
    normal: 30,
    fast: 15,
    instant: 0
  };

  const charDelay = speeds[typingSpeed];

  useEffect(() => {
    // ✅ Reset hasCalledCallback quand le message change
    hasCalledCallback.current = false;

    if (isLatest && !isUser && isStreaming && charDelay > 0) {
      console.log('🎬 [MESSAGE] Starting typing animation');
      setIsTypingComplete(false);
      currentIndexRef.current = 0;
      startTimeRef.current = undefined;

      const animate = (timestamp: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const targetIndex = Math.floor(elapsed / charDelay);

        if (targetIndex > currentIndexRef.current && currentIndexRef.current < message.content.length) {
          currentIndexRef.current = targetIndex;
          setDisplayedContent(message.content.slice(0, Math.min(targetIndex, message.content.length)));
        }

        if (currentIndexRef.current < message.content.length) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          console.log('✅ [MESSAGE] Animation complete');
          setIsTypingComplete(true);
          
          // ✅ Appelle le callback UNE SEULE FOIS
          if (!hasCalledCallback.current && onTypingComplete) {
            hasCalledCallback.current = true;
            onTypingComplete();
          }
        }
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      // Affichage immédiat
      setDisplayedContent(message.content);
      setIsTypingComplete(true);
      
      // ✅ Appelle le callback immédiatement si c'est le dernier message
      if (isLatest && !isUser && !hasCalledCallback.current && onTypingComplete) {
        hasCalledCallback.current = true;
        onTypingComplete();
      }
    }
  }, [message.content, message.id, isLatest, isUser, isStreaming, charDelay]); 

  useEffect(() => {
    if (isLatest && !isUser && isStreaming) {
      setDisplayedContent('');
      setIsTypingComplete(false);
      currentIndexRef.current = 0;
    }
  }, [message.id, isLatest, isUser, isStreaming]);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-8 py-5 mt-5 bg-red`}>
      <div className="max-w-[70%] transition-all duration-200">
        <div className={`text-sm font-medium mb-2 ${isUser ? 'text-right text-mezin-ciel' : 'text-left text-primary'}`}>
          {isUser ? 'Vous' : 'Mizen AI'}
        </div>
        <div className={`p-4 rounded-2xl ${isUser ? ' bg-slate-100' : ''} relative`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
            {displayedContent}
            {isLatest && !isUser && isStreaming && !isTypingComplete && (
              <span className="inline-block w-0.5 h-4 ml-0.5 bg-primary animate-pulse" />
            )}
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