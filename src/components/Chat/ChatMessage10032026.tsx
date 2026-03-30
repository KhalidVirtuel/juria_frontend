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

// ✅ Convertir Markdown → HTML stylé
const markdownToHTML = (text: string): string => {
  if (!text) return text;
  let html = text;

  // Blocs de code (avant tout le reste)
  html = html.replace(/```([\s\S]*?)```/g, '<pre style="background:#f6f8fa;border:1px solid #e1e4e8;border-radius:8px;padding:12px;overflow-x:auto;font-family:monospace;font-size:0.85em;margin:10px 0;white-space:pre-wrap;"><code>$1</code></pre>');
  
  // Code inline
  html = html.replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:2px 5px;border-radius:4px;font-family:monospace;font-size:0.88em;">$1</code>');

  // Titres
  html = html.replace(/^### (.+)$/gm, '<h3 style="font-size:1em;font-weight:700;margin:14px 0 6px;color:inherit;">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 style="font-size:1.1em;font-weight:700;margin:16px 0 8px;color:inherit;">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 style="font-size:1.2em;font-weight:700;margin:18px 0 10px;color:inherit;">$1</h1>');

  // Gras + italique combinés
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Gras
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italique
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Séparateurs
  html = html.replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid #e5e7eb;margin:14px 0;">');

  // Listes numérotées
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li style="margin:5px 0;padding-left:4px;">$2</li>');
  // Listes à puces  
  html = html.replace(/^[-*•] (.+)$/gm, '<li style="margin:5px 0;padding-left:4px;">$1</li>');
  
// Wrapper les <li> consécutifs en listes
html = html.replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g, (match) => {
  return `<ul style="margin:10px 0;padding-left:20px;list-style:disc;">${match}</ul>`;
});

// Sauts de ligne (après traitement des listes)
html = html.replace(/\n\n/g, '<br><br>');
html = html.replace(/\n/g, '<br>');

  // Nettoyer <br> autour des éléments block
  html = html.replace(/(<br>)+(<\/?(h[1-6]|ul|ol|li|pre|hr)[^>]*>)/g, '$2');
  html = html.replace(/(<\/?(h[1-6]|ul|ol|li|pre|hr)[^>]*>)(<br>)+/g, '$1');

  return html.trim();
};

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
  
  // ✅ CRITIQUE : Verrouiller l'état de streaming initial pour ce message
  const lockedStreamingState = useRef<boolean | null>(null);
  const messageIdRef = useRef<string>(message.id);

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

  // ✅ LOGIQUE PRINCIPALE : Gérer l'affichage avec état verrouillé
  useEffect(() => {
    // Détecter un nouveau message (changement d'ID)
    if (messageIdRef.current !== message.id) {
      console.log('🆕 [MESSAGE] New message detected:', message.id);
      messageIdRef.current = message.id;
      lockedStreamingState.current = null; // Reset pour nouveau message
      hasCalledCallback.current = false;
      hasAutoPlayed.current = false;
    }

    // Verrouiller l'état de streaming au PREMIER render de ce message en tant que dernier
// ✅ APRÈS
if (lockedStreamingState.current === null && isLatest && !isUser && message.content.length > 0) {
  lockedStreamingState.current = isStreaming;
  console.log('🔒 Locking streaming state to:', isStreaming);
}
    // Utiliser l'état VERROUILLÉ pour décider si on anime ou non
    const shouldAnimate = isLatest && !isUser && lockedStreamingState.current === true;

    // Annuler toute animation en cours
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // CAS 1: Messages qui ne sont PAS les derniers → affichage instantané
    if (!isLatest) {
      if (displayedContent !== message.content) {
        setDisplayedContent(message.content);
        setIsTypingComplete(true);
      }
      return;
    }

    // CAS 2: Messages utilisateur → affichage instantané
    if (isUser) {
      if (displayedContent !== message.content) {
        setDisplayedContent(message.content);
        setIsTypingComplete(true);
      }
      return;
    }

    // CAS 3: Dernier message IA SANS streaming → affichage instantané
    if (!shouldAnimate) {
      console.log('📝 [MESSAGE] Displaying without animation:', message.id);
      if (displayedContent !== message.content) {
        setDisplayedContent(message.content);
        setIsTypingComplete(true);
      }
      
      if (!hasCalledCallback.current && onTypingComplete) {
        hasCalledCallback.current = true;
        console.log('✅ [MESSAGE] Calling onTypingComplete (no streaming)');
        onTypingComplete();
      }
      return;
    }

    // CAS 4: Dernier message IA AVEC streaming → animation typing
    console.log('🎬 [MESSAGE] Starting typing animation for:', message.id);
    
    // Reset pour animation
    if (displayedContent !== '') {
    }
    setIsTypingComplete(false);
    if (currentIndexRef.current === 0 && !isTypingComplete) {
      console.log('🎬 Starting typing animation for:', message.id);
      
      // Initialisation de l'animation
      setDisplayedContent('');
      setIsTypingComplete(false);
      startTimeRef.current = undefined;
    }
    startTimeRef.current = undefined;

    if (charDelay > 0) {
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
            console.log('✅ [MESSAGE] Calling onTypingComplete (after animation)');
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
    
    // ✅ Si le contenu contient déjà du HTML, l'afficher directement
    const hasHTML = /<(strong|em|ul|ol|li|h[1-6]|pre|code|br|hr|p)[^>]*>/i.test(content);
    
    // ✅ Si contient des liens documents → traitement spécial
    if (documentLinkRegex.test(content)) {
      documentLinkRegex.lastIndex = 0;
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;

      while ((match = documentLinkRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          const textChunk = content.substring(lastIndex, match.index);
          const htmlChunk = markdownToHTML(textChunk);
          parts.push(<span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: htmlChunk }} />);
        }

        // ✅ Capturer les valeurs dans des variables locales pour éviter closure sur match null
        const docId = match[2];
        const docText = match[1];
        const matchIndex = match.index;

        parts.push(
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDocumentLinkClick?.(docId)}
            title="Editer"
            key={`doc-${docId}-${matchIndex}`}
            className='border border-mezin'
          >
            <Edit className="w-4 h-4" />
            {docText}
          </Button>
        );

        lastIndex = matchIndex + match[0].length;
      }

      if (lastIndex < content.length) {
        const remaining = content.substring(lastIndex);
        parts.push(<span key="last" dangerouslySetInnerHTML={{ __html: markdownToHTML(remaining) }} />);
      }

      return <>{parts}</>;
    }

    // ✅ Sinon : convertir Markdown → HTML et afficher
    const htmlContent = hasHTML ? content : markdownToHTML(content);
    return <span dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-8 py-5 mt-5`}>
      <div className="max-w-[70%] transition-all duration-200">
        <div className={`text-sm font-medium mb-2 ${isUser ? 'text-right text-mezin-ciel' : 'text-left text-primary'}`}>
          {isUser ? 'Vous' : 'Mizen AI'}
        </div>
        <div className={`p-4 rounded-2xl ${isUser ? ' bg-slate-100' : ''} relative`}>
          <div className="text-sm leading-relaxed text-foreground prose-custom">
            {renderContent(displayedContent)}
            {isLatest && !isUser && lockedStreamingState.current === true && !isTypingComplete && (
              <span className="inline-block w-0.5 h-4 ml-0.5 bg-primary animate-pulse" />
            )}
          </div>

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