import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Send, Search, FileText, MessageSquare, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ChatContainer from '../Chat/ChatContainer';
import { useChatStore } from '@/store/chatStore';
import { sendMessageWithStreaming, StreamStep } from '@/lib/streamingApi';
import type { LoadingStep } from '../Chat/ChatLoadingSteps';
import { VoiceRecorder } from '../Chat/VoiceRecorder'; // ✅ NOUVEAU
import { useTypingEffect } from '@/hooks/useTypingEffect'; // ✅ NOUVEAU

interface ChatSectionFolderProps {
  folderId: number;
  streamingSteps?: LoadingStep[];
  externalOptimisticMessage?: string | null;
  onTypingComplete?: () => void;
}

const ChatSectionFolder: React.FC<ChatSectionFolderProps> = ({ 
  folderId, 
  streamingSteps: externalStreamingSteps = [],
  externalOptimisticMessage = null,
  onTypingComplete: externalOnTypingComplete
}) => {
  const [message, setMessage] = useState('');
  const [streamingSteps, setStreamingSteps] = useState<LoadingStep[]>([]);
  const [optimisticMessage, setOptimisticMessage] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState(''); // ✅ NOUVEAU
  const [isVoiceInput, setIsVoiceInput] = useState(false); // ✅ NOUVEAU
  const [audioData, setAudioData] = useState<{audio: string; mimeType: string; voice: string} | null>(null); // ✅ NOUVEAU
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ NOUVEAU : Hook typing animation
  const { displayedText, isTyping: isTypingTranscript } = useTypingEffect(transcribedText, 30);

  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    isTyping,
    setIsTyping,
    loadConversation,
  } = useChatStore();

  const currentConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = currentConversation?.messages || [];

  const activeOptimisticMessage = externalOptimisticMessage || optimisticMessage;
  
  const displayMessages = activeOptimisticMessage 
    ? [...messages, { 
        id: 'optimistic',
        conversationId: activeConversationId || '',
        content: activeOptimisticMessage, 
        role: 'user' as const,
        createdAt: new Date().toISOString(),
        timestamp: Date.now(),
        sources: []
      }]
    : messages;

  const handleTypingComplete = useCallback(() => {
    console.log('✅ [FOLDER-SECTION] Typing animation complete, setting isTyping to false');
    setIsTyping(false);
    externalOnTypingComplete?.();
  }, [setIsTyping, externalOnTypingComplete]);

  // ✅ NOUVEAU : Auto-send après animation typing
  useEffect(() => {
    if (displayedText && !isTypingTranscript) {
      const textToSend = displayedText.trim();
      setMessage(displayedText);
      setTranscribedText('');
      
      if (textToSend) {
        console.log('🚀 Auto-envoi après animation typing:', textToSend);
        setTimeout(() => {
          sendVoiceMessage(textToSend);
        }, 500);
      }
    }
  }, [displayedText, isTypingTranscript]);

  useEffect(() => {
    const initConversation = async () => {
      if (!activeConversationId) {
        const folderConversations = conversations.filter(
          c => String(c.folderId) === String(folderId)
        );
        
        if (folderConversations.length > 0) {
          setActiveConversationId(folderConversations[0].id);
        }
      }
    };

    initConversation();
  }, [folderId, activeConversationId, conversations, setActiveConversationId]);

  const handleOpenUpload = () => fileInputRef.current?.click();

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    toast.success(`${files.length} fichier(s) sélectionné(s)`);
  };

  // ✅ NOUVEAU : Callback pour transcription vocale
  const handleVoiceTranscript = (text: string) => {
    console.log('🎤 Transcription reçue:', text);
    setTranscribedText(text);
    setIsVoiceInput(true);
  };

  // ✅ NOUVEAU : Fonction séparée pour envoi vocal
  const sendVoiceMessage = async (messageToSend: string) => {
    if (!messageToSend) return;

    console.log('🎬 [VOICE] Starting voice message...', { messageToSend, folderId });

    setMessage('');
    setOptimisticMessage(messageToSend);
    setIsTyping(true);
    setStreamingSteps([]);
    setAudioData(null);

    try {
      let conversationId = activeConversationId;
      
      if (!conversationId) {
        conversationId = await createConversation(String(folderId));
        if (!conversationId) throw new Error('Failed to create conversation');
        setActiveConversationId(conversationId);
      }

      await loadConversation(conversationId);
      await new Promise(resolve => setTimeout(resolve, 200));

      const result = await sendMessageWithStreaming(
        conversationId,
        messageToSend,
        (step: StreamStep) => {
          const stepMap: Record<string, Partial<LoadingStep>> = {
            saving_user: { id: 'save_user', icon: <Save className="w-5 h-5" />, message: 'Enregistrement...', status: 'loading' },
            searching: { id: 'search', icon: <Search className="w-5 h-5" />, message: 'Recherche...', details: step.details, status: 'loading' },
            documents_found: { id: 'docs', icon: <FileText className="w-5 h-5" />, message: step.message || 'Documents trouvés', details: step.details, status: 'complete' },
            no_documents: { id: 'docs', icon: <FileText className="w-5 h-5" />, message: 'Connaissances générales', details: step.details, status: 'complete' },
            rag_error: { id: 'docs', icon: <FileText className="w-5 h-5" />, message: step.message || 'Modèle de base', status: 'complete' },
            generating: { id: 'generate', icon: <Sparkles className="w-5 h-5" />, message: 'Génération...', details: step.details, status: 'loading' },
            saving_timeline: { id: 'timeline', icon: <MessageSquare className="w-5 h-5" />, message: step.message || 'Événements...', status: 'loading' },
            saving_documents: { id: 'documents', icon: <FileText className="w-5 h-5" />, message: step.message || 'Documents...', status: 'loading' },
            complete: { id: 'complete_step', icon: <Sparkles className="w-5 h-5" />, message: 'Réponse générée', status: 'complete' },
          };

          if (step.step && stepMap[step.step]) {
            setStreamingSteps(prev => {
              const newStep = stepMap[step.step] as LoadingStep;
              const existing = prev.find(s => s.id === newStep.id);
              return existing ? prev.map(s => s.id === newStep.id ? { ...s, ...newStep } : s) : [...prev, newStep];
            });
          }
        },
        true // ✅ isVoiceInput = true
      );

      // ✅ Capturer l'audio de la réponse
      if (result.audioData) {
        console.log('🔊 Audio reçu:', result.audioData);
        setAudioData(result.audioData);
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      setStreamingSteps([]);
      await loadConversation(conversationId);
      setOptimisticMessage(null);

    } catch (error: any) {
      console.error('❌ [VOICE] Error:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi du message');
      setOptimisticMessage(null);
      setIsTyping(false);
    } finally {
      setIsVoiceInput(false);
    }
  };

  const handleStartNewChat = async () => {
    const messageToSend = message.trim();
    if (!messageToSend) return;

    console.log('🎬 [FOLDER-SECTION] Starting new chat...', { messageToSend, folderId });

    setMessage('');
    setOptimisticMessage(messageToSend);
    setIsTyping(true);
    setStreamingSteps([]);
    setAudioData(null);

    try {
      let conversationId = activeConversationId;
      
      if (!conversationId) {
        conversationId = await createConversation(String(folderId));
        if (!conversationId) throw new Error('Failed to create conversation');
        setActiveConversationId(conversationId);
      }

      await loadConversation(conversationId);
      await new Promise(resolve => setTimeout(resolve, 200));

      const result = await sendMessageWithStreaming(
        conversationId,
        messageToSend,
        (step: StreamStep) => {
          const stepMap: Record<string, Partial<LoadingStep>> = {
            saving_user: { id: 'save_user', icon: <Save className="w-5 h-5" />, message: 'Enregistrement de votre question...', status: 'loading' },
            searching: { id: 'search', icon: <Search className="w-5 h-5" />, message: 'Recherche dans la base de connaissances...', details: step.details, status: 'loading' },
            documents_found: { id: 'docs', icon: <FileText className="w-5 h-5" />, message: step.message || 'Documents trouvés', details: step.details, status: 'complete' },
            no_documents: { id: 'docs', icon: <FileText className="w-5 h-5" />, message: 'Utilisation des connaissances générales', details: step.details, status: 'complete' },
            rag_error: { id: 'docs', icon: <FileText className="w-5 h-5" />, message: step.message || 'Utilisation du modèle de base', status: 'complete' },
            generating: { id: 'generate', icon: <Sparkles className="w-5 h-5" />, message: 'Génération de la réponse...', details: step.details, status: 'loading' },
            saving_timeline: { id: 'timeline', icon: <MessageSquare className="w-5 h-5" />, message: step.message || 'Création des événements...', status: 'loading' },
            saving_documents: { id: 'documents', icon: <FileText className="w-5 h-5" />, message: step.message || 'Création des documents...', status: 'loading' },
            complete: { id: 'complete_step', icon: <Sparkles className="w-5 h-5" />, message: 'Réponse générée avec succès', status: 'complete' },
          };

          if (step.step && stepMap[step.step]) {
            setStreamingSteps(prev => {
              const newStep = stepMap[step.step] as LoadingStep;
              const existing = prev.find(s => s.id === newStep.id);
              return existing ? prev.map(s => s.id === newStep.id ? { ...s, ...newStep } : s) : [...prev, newStep];
            });
          }
        },
        isVoiceInput // ✅ Passer isVoiceInput
      );

      // ✅ Capturer l'audio
      if (result.audioData) {
        console.log('🔊 Audio reçu:', result.audioData);
        setAudioData(result.audioData);
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      setStreamingSteps([]);
      await loadConversation(conversationId);
      setOptimisticMessage(null);

    } catch (error: any) {
      console.error('❌ [FOLDER-SECTION] Error:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi du message');
      setOptimisticMessage(null);
      setIsTyping(false);
    } finally {
      setIsVoiceInput(false);
    }
  };

  const hasMessages = messages.length > 0;
  const activeSteps = externalStreamingSteps.length > 0 ? externalStreamingSteps : streamingSteps;

  return (
    <div className="h-full">
      {hasMessages || activeConversationId || activeOptimisticMessage ? (
        <div className="animate-fade-in h-full">
          <ChatContainer
            messages={displayMessages}
            isTyping={isTyping}
            onSendMessage={handleStartNewChat} 
            inputValue={message}
            onInputChange={(value) => {
              setMessage(value);
              setIsVoiceInput(false); // Reset si typing manuel
            }}
            streamingSteps={streamingSteps}
            onTypingComplete={handleTypingComplete}
            audioData={audioData} // ✅ NOUVEAU
            onVoiceTranscript={handleVoiceTranscript} // ✅ NOUVEAU
            isTypingTranscript={isTypingTranscript} // ✅ NOUVEAU
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

                <div className="relative flex items-center gap-2 p-2">
                  <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFilesSelected} />
                  
                  <Button type="button" onClick={handleOpenUpload} size="icon" variant="ghost" 
                    className="h-10 w-10 flex-shrink-0 text-mezin hover:text-white hover:bg-mezin">
                    <Plus className="h-5 w-5" />
                  </Button>

                  {/* ✅ NOUVEAU : Micro PTT */}
                  <VoiceRecorder 
                    onTranscript={handleVoiceTranscript}
                    disabled={isTyping || isTypingTranscript}
                  />

                  <input
                    type="text"
                    value={isTypingTranscript ? displayedText : message}
                    onChange={(e) => {
                      if (!isTypingTranscript) {
                        setMessage(e.target.value);
                        setIsVoiceInput(false);
                      }
                    }}
                    placeholder="Maître, comment puis-je vous aider ?"
                    className="flex-1 bg-transparent text-foreground placeholder-muted-foreground/70 outline-none text-lg py-3 px-2 rounded-full border-0 focus:outline-none focus:ring-0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && message.trim() && !isTyping) {
                        handleStartNewChat();
                      }
                    }}
                    disabled={isTyping || isTypingTranscript}
                  />

                  <Button onClick={handleStartNewChat} size="icon" 
                    className="h-10 w-10 flex-shrink-0 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground" 
                    disabled={isTyping || !message.trim()}>
                    <Send className="h-5 w-5" />
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