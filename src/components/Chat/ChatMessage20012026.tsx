import React, { useState, useEffect, useRef } from 'react';
import type { Message } from '@/store/types';
import { Button } from '../ui/button';
import { Edit, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
  isStreaming?: boolean;
  typingSpeed?: 'slow' | 'normal' | 'fast' | 'instant';
  onTypingComplete?: () => void;
  onDocumentLinkClick?: (documentId: string) => void;
  audioData?: { audio: string; mimeType: string; voice: string } | null;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isLatest = false, 
  isStreaming = false,
  typingSpeed = 'fast',
  onTypingComplete,
  onDocumentLinkClick,
  audioData
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const currentIndexRef = useRef(0);
  const hasCalledCallback = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasAutoPlayed = useRef(false);

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

  // Auto-play audio après typing animation
  useEffect(() => {
    if (!isUser && audioData && isTypingComplete && !hasAutoPlayed.current) {
      console.log('🔊 Auto-playing audio...');
      hasAutoPlayed.current = true;
      playAudio();
    }
  }, [audioData, isTypingComplete, isUser]);

  const playAudio = () => {
    if (!audioData) return;

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const byteCharacters = atob(audioData.audio);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: audioData.mimeType });
      const audioUrl = URL.createObjectURL(blob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        console.log('🔊 Audio started');
        setIsPlayingAudio(true);
      };

      audio.onended = () => {
        console.log('✅ Audio ended');
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = (e) => {
        console.error('❌ Audio error:', e);
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.play().catch(err => {
        console.error('❌ Play error:', err);
        setIsPlayingAudio(false);
      });

    } catch (error) {
      console.error('❌ Audio conversion error:', error);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // ✅ FIXÉ : Reset quand un nouveau message arrive
  useEffect(() => {
    if (isLatest && !isUser && isStreaming) {
      console.log('🎬 [MESSAGE] Reset for new streaming message:', message.id);
      setDisplayedContent('');
      setIsTypingComplete(false);
      currentIndexRef.current = 0;
      hasAutoPlayed.current = false;
      hasCalledCallback.current = false;
    }
  }, [message.id, isLatest, isUser, isStreaming]);

  // ✅ FIXÉ : Gérer l'animation typing avec checks
  useEffect(() => {
    // Si ce n'est PAS le dernier message, afficher immédiatement
    if (!isLatest) {
      console.log('🎬 Si ce n est PAS le dernier message, afficher immédiatement', message.content);
      setDisplayedContent(message.content);
      setIsTypingComplete(true);
      return;
    }

    // Si c'est un message utilisateur, afficher immédiatement
    if (isUser) {
      console.log('🎬 Si un message utilisateur, afficher immédiatement', message.content);
      setDisplayedContent(message.content);
      setIsTypingComplete(true);
      return;
    }

    // Si pas de streaming, afficher immédiatement
    if (!isStreaming) {
      console.log('🎬 Si pas de streaming, afficher immédiatement', message.content);
      setDisplayedContent(message.content);
      setIsTypingComplete(true);
      
      if (!hasCalledCallback.current && onTypingComplete) {
        hasCalledCallback.current = true;
        onTypingComplete();
      }
      return;
    }

    // Animation typing pour le dernier message IA en streaming
    if (charDelay > 0) {
      console.log('🎬 [MESSAGE] Starting typing animation for:', message.id);
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
      // charDelay === 0, affichage instantané
      setDisplayedContent(message.content);
      setIsTypingComplete(true);
      if (!hasCalledCallback.current && onTypingComplete) {
        hasCalledCallback.current = true;
        onTypingComplete();
      }
    }
  }, [message.content, message.id, isLatest, isUser, isStreaming, charDelay, onTypingComplete]);

  const renderContent = (content: string) => {
    const documentLinkRegex = /\[([^\]]+)\]\(#document-(\d+)\)/g;
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = documentLinkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      const linkText = match[1];
      const documentId = match[2];
      
      parts.push(
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onDocumentLinkClick?.(documentId)}
          title="Editer"
          key={`doc-${documentId}-${match.index}`}
          className='border border-mezin'
        >
          <Edit className="w-4 h-4" />
          {linkText}
        </Button>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-8 py-5 mt-5`}>
      <div className="max-w-[70%] transition-all duration-200">
        <div className={`text-sm font-medium mb-2 ${isUser ? 'text-right text-mezin-ciel' : 'text-left text-primary'}`}>
          {isUser ? 'Vous' : 'Mizen AI'}
        </div>
        <div className={`p-4 rounded-2xl ${isUser ? ' bg-slate-100' : ''} relative`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
            {renderContent(displayedContent)}
            {isLatest && !isUser && isStreaming && !isTypingComplete && (
              <span className="inline-block w-0.5 h-4 ml-0.5 bg-primary animate-pulse" />
            )}
          </p>

          {/* Bouton audio */}
          {!isUser && audioData && isTypingComplete && (
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={isPlayingAudio ? stopAudio : playAudio}
                className="flex items-center gap-2"
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Arrêter</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Écouter</span>
                  </>
                )}
              </Button>
              {isPlayingAudio && (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              )}
            </div>
          )}
        </div>
        <div className={`text-xs opacity-60 mt-2 font-medium ${isUser ? 'text-right text-mezin' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;