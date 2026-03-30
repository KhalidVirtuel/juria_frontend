import React, { useState, useRef, useEffect } from 'react';
import { Plus, Send, Search, FileText, MessageSquare, Save, Sparkles, LayoutGrid, ChevronRight, Brain, ShieldCheck, Gavel, AlertTriangle, Compass, Handshake, CheckSquare, Heart, Building2, Briefcase, Home, Car, Users, Clock, ClipboardList, Scale, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import ChatContainer from '../Chat/ChatContainer';
import ChatSectionFolder from '../Sections/ChatSectionFolder';
import { useChatStore } from '@/store/chatStore';
import { sendMessageWithStreaming, StreamStep } from '@/lib/streamingApi';
import type { LoadingStep } from '../Chat/ChatLoadingSteps';
import { VoiceRecorder } from '../Chat/VoiceRecorder';
import { useTypingEffect } from '@/hooks/useTypingEffect';
import { quickAccessWorkflows } from '@/data/workflows';

const iconMap: Record<string, React.ElementType> = {
  Brain, ShieldCheck, Gavel, AlertTriangle, Compass, PenTool, Handshake, CheckSquare,
  FileText, Heart, Building2, Briefcase, Home, Car, Users, Scale, Search, Clock, ClipboardList
};

const ChatSection: React.FC = () => {
  const [message, setMessage] = useState('');
  const [streamingSteps, setStreamingSteps] = useState<LoadingStep[]>([]);
  const [transcribedText, setTranscribedText] = useState('');
  const [workflowMenuOpen, setWorkflowMenuOpen] = useState(false);
  const [activeQuickWorkflows, setActiveQuickWorkflows] = useState<any[]>([]);
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const [audioData, setAudioData] = useState<{audio: string; mimeType: string; voice: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
  
  const isFromFolder = currentConversation?.folderId !== null && currentConversation?.folderId !== undefined;
  const folderId = currentConversation?.folderId;
  const displayWorkflows = quickAccessWorkflows || [];

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  // ✅ FIX : Capturer le texte AVANT setMessage
  useEffect(() => {
    if (displayedText && !isTypingTranscript) {
      const textToSend = displayedText.trim(); // ✅ Capturer AVANT
      setMessage(displayedText);
      setTranscribedText('');
      
      if (textToSend) {
        console.log('🚀 Auto-envoi après animation typing:', textToSend);
        setTimeout(() => {
          sendVoiceMessage(textToSend); // ✅ Utiliser le texte capturé
        }, 500);
      }
    }
  }, [displayedText, isTypingTranscript]);

  const handleOpenUpload = () => fileInputRef.current?.click();
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    toast.success(`${files.length} fichier(s) sélectionné(s)`);
  };

  const toggleQuickWorkflow = (workflow: any) => {
    setActiveQuickWorkflows(prev => {
      const exists = prev.some(w => w.id === workflow.id);
      return exists ? prev.filter(w => w.id !== workflow.id) : [...prev, workflow];
    });
  };

  // ✅ NOUVEAU : Fonction séparée pour envoi vocal
  const sendVoiceMessage = async (messageToSend: string) => {
    if (!messageToSend) return;

    setMessage('');
    setIsTyping(true);
    setStreamingSteps([]);
    setAudioData(null);

    try {
      let conversationId = activeConversationId;
      if (!conversationId) {
        conversationId = await createConversation();
        if (!conversationId) throw new Error('Failed to create conversation');
        setActiveConversationId(conversationId);
      }

      console.log('📡 Sending voice message, isVoiceInput: true');

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
        true // ✅ Toujours true pour vocal
      );

      if (result.audioData) {
        console.log('🔊 Audio reçu:', result.audioData);
        setAudioData(result.audioData);
      }

      await loadConversation(conversationId);

    } catch (error: any) {
      console.error('❌ [VOICE] Error:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setIsTyping(false);
      setIsVoiceInput(false);
      setTimeout(() => setStreamingSteps([]), 500);
    }
  };

  // ✅ Fonction pour envoi manuel (clavier/bouton)
  const handleStartNewChat = async () => {
    const messageToSend = message.trim();
    if (!messageToSend) return;

    setMessage('');
    setIsTyping(true);
    setStreamingSteps([]);
    setAudioData(null);

    try {
      let conversationId = activeConversationId;
      if (!conversationId) {
        conversationId = await createConversation();
        if (!conversationId) throw new Error('Failed to create conversation');
        setActiveConversationId(conversationId);
      }

      console.log('📡 Sending message, isVoiceInput:', isVoiceInput);

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
        isVoiceInput
      );

      if (result.audioData) {
        console.log('🔊 Audio reçu:', result.audioData);
        setAudioData(result.audioData);
      }

      await loadConversation(conversationId);

    } catch (error: any) {
      console.error('❌ [CHAT] Error:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setIsTyping(false);
      setIsVoiceInput(false);
      setTimeout(() => setStreamingSteps([]), 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !isTyping) handleStartNewChat();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="h-full">
      {isFromFolder && folderId ? (
        <ChatSectionFolder folderId={Number(folderId)} />
      ) : (
        <>
          {hasMessages && currentConversation ? (
            <div className="animate-fade-in">
              <ChatContainer
                messages={messages}
                isTyping={isTyping}
                onSendMessage={handleStartNewChat} 
                inputValue={message}
                onInputChange={setMessage}
                streamingSteps={streamingSteps}
                audioData={audioData}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-8 bg-white animate-fade-in">
              <div className="w-full max-w-2xl mx-auto text-center">
                <div className="relative max-w-3xl mx-auto mb-2">
                  <div className="relative liquid-glass-container">
                    <div className="relative flex items-start gap-2 p-2 pt-0">
                      <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFilesSelected} />
                      
                      <Button type="button" onClick={handleOpenUpload} size="icon" variant="ghost" 
                        className="h-10 w-10 flex-shrink-0 self-end text-foreground hover:text-primary hover:bg-muted/40">
                        <Plus className="h-5 w-5" />
                      </Button>

                      <VoiceRecorder 
                        onTranscript={(text) => {
                          console.log('🎤 Transcription reçue:', text);
                          setTranscribedText(text);
                          setIsVoiceInput(true);
                        }}
                        disabled={isTyping || isTypingTranscript}
                      />

                      <textarea
                        ref={textareaRef}
                        value={isTypingTranscript ? displayedText : message}
                        onChange={(e) => {
                          if (!isTypingTranscript) {
                            setMessage(e.target.value);
                            setIsVoiceInput(false);
                          }
                        }}
                        placeholder="Maître, comment puis-je vous aider ?"
                        rows={1}
                        className="flex-1 bg-transparent text-foreground placeholder-muted-foreground/70 outline-none text-lg py-3 px-2 rounded-2xl border-0 resize-none overflow-hidden focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                        onKeyDown={handleKeyDown}
                        disabled={isTyping || isTypingTranscript}
                        style={{ minHeight: '44px', maxHeight: '200px' }}
                      />

                      <Button onClick={handleStartNewChat} size="icon" 
                        className="h-10 w-10 flex-shrink-0 self-end rounded-full bg-accent hover:bg-accent/90 text-accent-foreground" 
                        disabled={isTyping || !message.trim()}>
                        <Send className="h-5 w-5" />
                      </Button>

                      <Popover open={workflowMenuOpen} onOpenChange={setWorkflowMenuOpen}>
                        <PopoverTrigger asChild>
                          <Button type="button" size="sm" variant="ghost" 
                            className="h-8 w-8 flex-shrink-0 self-center text-foreground hover:text-primary hover:bg-muted/40">
                            <LayoutGrid className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2" align="start" side="top" sideOffset={8}>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground px-2 py-1">Modes de travail</p>
                            {displayWorkflows.slice(0, 5).map((workflow) => {
                              const IconComponent = iconMap[workflow.icon] || Brain;
                              const isActive = activeQuickWorkflows.some(w => w.id === workflow.id);
                              return (
                                <button key={workflow.id}
                                  onClick={() => { toggleQuickWorkflow(workflow); setWorkflowMenuOpen(false); }}
                                  className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-left transition-colors ${
                                    isActive ? 'bg-[#003878] text-white' : 'hover:bg-muted text-foreground'
                                  }`}>
                                  <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center ${
                                    isActive ? 'bg-white/20' : 'bg-[#003878]/5'
                                  }`}>
                                    <IconComponent className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-[#003878]'}`} />
                                  </div>
                                  <div className={`w-px h-4 mx-1 ${isActive ? 'bg-white/30' : 'bg-border'}`} />
                                  <span className="text-sm font-medium truncate">{workflow.shortTitle}</span>
                                </button>
                              );
                            })}
                            <div className="border-t border-border mt-2 pt-2">
                              <button onClick={() => setWorkflowMenuOpen(false)}
                                className="w-full flex items-center justify-between px-2 py-2 rounded-md text-left hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                <span className="text-sm">Voir tous les workflows</span>
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatSection;