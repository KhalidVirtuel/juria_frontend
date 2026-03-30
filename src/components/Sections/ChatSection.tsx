import React, { useState, useRef, useEffect } from 'react';
import { Plus, Send, Search, FileText, MessageSquare, Save, Sparkles, LayoutGrid, ChevronRight, Brain, ShieldCheck, Gavel, AlertTriangle, Compass, Handshake, CheckSquare, Heart, Building2, Briefcase, Home, Car, Users, Clock, ClipboardList, Scale, PenTool, X } from 'lucide-react';
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
import { quickAccessWorkflows, Workflow } from '@/data/workflows';
import mizenLogo from '@/assets/mizen-icon.png';

const iconMap: Record<string, React.ElementType> = {
  Brain, ShieldCheck, Gavel, AlertTriangle, Compass, PenTool, Handshake, CheckSquare,
  FileText, Heart, Building2, Briefcase, Home, Car, Users, Scale, Search, Clock, ClipboardList
};

const ChatSection: React.FC = () => {
  const [message, setMessage] = useState('');
  const [streamingSteps, setStreamingSteps] = useState<LoadingStep[]>([]);
  const [transcribedText, setTranscribedText] = useState('');
  const [workflowMenuOpen, setWorkflowMenuOpen] = useState(false);
  const [activeQuickWorkflows, setActiveQuickWorkflows] = useState<Workflow[]>([]);
  const [activeModes, setActiveModes] = useState<string[]>([]);
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const [audioData, setAudioData] = useState<{audio: string; mimeType: string; voice: string} | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // ✅ NOUVEAU

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
    deactivateWorkflow,
  } = useChatStore();
  
  // ✅ State pour forcer l'affichage du ChatContainer immédiatement
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);

  const currentConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = currentConversation?.messages || [];
  
  const isFromFolder = currentConversation?.folderId !== null && currentConversation?.folderId !== undefined;
  const folderId = currentConversation?.folderId;
  const displayWorkflows = quickAccessWorkflows;
  
  const activeWorkflows = (currentConversation as any)?.activeWorkflows || [];

  const modes = [
    { id: 'analyser', label: 'Analyser', icon: Search },
    { id: 'generer', label: 'Générer', icon: PenTool },
    { id: 'evaluer', label: 'Évaluer', icon: Scale },
  ];

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

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

  const handleOpenUpload = () => fileInputRef.current?.click();
const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  
  // ✅ Stocker les fichiers dans le state
  const fileArray = Array.from(files);
  setSelectedFiles(prev => [...prev, ...fileArray]);
  
  toast.success(`${files.length} fichier(s) sélectionné(s)`);
  
  // ✅ Réinitialiser l'input pour permettre de sélectionner les mêmes fichiers
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};


const removeFile = (index: number) => {
  setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  toast.info('Fichier retiré');
};

const clearAllFiles = () => {
  setSelectedFiles([]);
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};

  const toggleQuickWorkflow = (workflow: Workflow) => {
    setActiveQuickWorkflows(prev => {
      const exists = prev.find(w => w.id === workflow.id);
      if (exists) {
        return prev.filter(w => w.id !== workflow.id);
      }
      return [...prev, workflow];
    });
  };

  const removeQuickWorkflow = (workflowId: string) => {
    setActiveQuickWorkflows(prev => prev.filter(w => w.id !== workflowId));
  };

  const toggleMode = (modeId: string) => {
    setActiveModes(prev => 
      prev.includes(modeId) 
        ? prev.filter(m => m !== modeId)
        : [...prev, modeId]
    );
  };

  const removeMode = (modeId: string) => {
    setActiveModes(prev => prev.filter(m => m !== modeId));
  };

  const removeWorkflow = (workflowId: string) => {
    if (activeConversationId) {
      deactivateWorkflow(activeConversationId, workflowId);
      toast.success('Workflow désactivé');
    }
  };

  const handleVoiceTranscript = (text: string) => {
    console.log('🎤 Transcription reçue:', text);
    setTranscribedText(text);
    setIsVoiceInput(true);
  };

  const handleTypingComplete = () => {
    console.log('✅ [CHAT-SECTION] Typing animation complete, setting isTyping to false');
    setIsTyping(false);
  };

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
        true
      );

      if (result.audioData) {
        setAudioData(result.audioData);
      }

      await loadConversation(conversationId);
      setPendingUserMessage(null); // ✅ Effacer le message pending après chargement

    } catch (error: any) {
      setPendingUserMessage(null); // ✅ Effacer aussi en cas d'erreur
      console.error('❌ [VOICE] Error:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi du message');
      setIsTyping(false); // ✅ Seulement en cas d'erreur
    } finally {
      setIsVoiceInput(false);
      setTimeout(() => setStreamingSteps([]), 500);
    }
  };

  const handleStartNewChat = async () => {
      if (!message.trim() && selectedFiles.length === 0) return;

    const messageToSend = message.trim();
    if (!messageToSend) return;

   

    // ✅ Créer le message utilisateur IMMÉDIATEMENT (optimiste)
    const optimisticUserMessage = {
      id: `temp-${Date.now()}`,
      conversationId: activeConversationId || 'pending',
      role: 'user' as const,
      content: messageToSend,
      timestamp: Date.now(),
    };

    try {
      let conversationId = activeConversationId;
      if (!conversationId) {
        conversationId = await createConversation();
        if (!conversationId) throw new Error('Failed to create conversation');
        setActiveConversationId(conversationId);
        
        // ✅ Mettre à jour l'ID du message avec la vraie conversation
        optimisticUserMessage.conversationId = conversationId;
      }

      // ✅ Marquer qu'un message est en attente → affiche ChatContainer immédiatement
      setPendingUserMessage(messageToSend);
      
      // ✅ Cacher le textarea
      setMessage('');

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
        setAudioData(result.audioData);
      }
      setIsTyping(true);
      setStreamingSteps([]);
      setAudioData(null);
      await loadConversation(conversationId);
      setPendingUserMessage(null); // ✅ Effacer le message pending après chargement

    } catch (error: any) {
      setPendingUserMessage(null); // ✅ Effacer aussi en cas d'erreur
      console.error('❌ [CHAT] Error:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi du message');
      setIsTyping(false); // ✅ Seulement en cas d'erreur
    } finally {



       setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
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

  // Calculate total active tags
  const allActiveTags = activeModes.length + activeWorkflows.length + activeQuickWorkflows.length;

  const renderActiveTagsInInput = () => {
    if (allActiveTags === 0) return null;
    
    return (
      <div className="flex items-start gap-2 mb-3 flex-wrap">
        {/* Workflow tags */}
        {activeWorkflows.map((workflow: any) => {
          const IconComponent = iconMap[workflow.icon] || Brain;
          return (
            <span
              key={`workflow-${workflow.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border-2 border-[#003878] text-[#003878] animate-scale-in whitespace-nowrap"
            >
              <IconComponent className="h-3.5 w-3.5" />
              {workflow.shortTitle}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeWorkflow(workflow.id);
                }}
                className="hover:bg-[#003878]/10 rounded p-0.5 transition-colors ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}

        {/* Quick workflow tags */}
        {activeQuickWorkflows.map(workflow => {
          const IconComponent = iconMap[workflow.icon] || Brain;
          return (
            <span
              key={`quick-${workflow.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border-2 border-[#003878] text-[#003878] animate-scale-in whitespace-nowrap"
            >
              <IconComponent className="h-3.5 w-3.5" />
              {workflow.shortTitle}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeQuickWorkflow(workflow.id);
                }}
                className="hover:bg-[#003878]/10 rounded p-0.5 transition-colors ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}
        
        {/* Mode tags */}
        {activeModes.map(modeId => {
          const mode = modes.find(m => m.id === modeId);
          const IconComponent = mode?.icon;
          return (
            <span
              key={`mode-${modeId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border-2 border-[#003878] text-[#003878] animate-scale-in whitespace-nowrap"
            >
              {IconComponent && <IconComponent className="h-3.5 w-3.5" />}
              {mode?.label}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeMode(modeId);
                }}
                className="hover:bg-[#003878]/10 rounded p-0.5 transition-colors ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}
      </div>
    );
  };

  // ✅ Afficher ChatContainer si messages OU message en attente
  const hasMessages = messages.length > 0 || pendingUserMessage !== null;

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
                onInputChange={(value) => {
                  setMessage(value);
                  setIsVoiceInput(false);
                }}
                streamingSteps={streamingSteps}
                onTypingComplete={handleTypingComplete}
                audioData={audioData}
                onVoiceTranscript={handleVoiceTranscript}
                isTypingTranscript={isTypingTranscript}
                pendingUserMessage={pendingUserMessage}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-8 bg-white animate-fade-in">
              <div className="w-full max-w-2xl mx-auto text-center">
                <img src={mizenLogo} alt="" className='w-1/5 mx-auto mb-6' />
                <div className="relative max-w-3xl mx-auto mb-2">
                  {/* Tags actifs */}
                  {allActiveTags > 0 && renderActiveTagsInInput()}
                  {/* ✅ Indicateur de fichiers sélectionnés */}
                      {selectedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 px-3 py-2 border-b border-blue-100">
                          {selectedFiles.map((file, index) => (
                            <div 
                              key={`${file.name}-${index}`}
                              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                              {/* Icône du fichier */}
                              <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              
                              {/* Nom du fichier */}
                              <span className="text-sm text-gray-700 max-w-[150px] truncate">
                                {file.name}
                              </span>
                              
                              {/* Taille du fichier */}
                              <span className="text-xs text-gray-500">
                                {(file.size / 1024).toFixed(1)} KB
                              </span>
                              
                              {/* Bouton supprimer */}
                              <button
                                onClick={() => removeFile(index)}
                                className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                                aria-label="Retirer le fichier"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          
                          {/* Bouton tout effacer */}
                          {selectedFiles.length > 1 && (
                            <button
                              onClick={clearAllFiles}
                              className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              Tout effacer
                            </button>
                          )}
                        </div>
                      )}
                  <div className="relative liquid-glass-container">
                    <div className="relative flex items-center gap-0 py-2 px-3">
                      <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFilesSelected} />
                      
                      <div className="relative">
                      <Button 
                        type="button" 
                        onClick={handleOpenUpload} 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 flex-shrink-0 text-foreground hover:text-white hover:bg-mezin"
                        aria-label="Uploader des éléments"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                                {/* ✅ Badge de compteur */}
                                {selectedFiles.length > 0 && (
                                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full border-2 border-white">
                                    {selectedFiles.length}
                                  </span>
                                )}

                    </div>

                      <VoiceRecorder 
                        onTranscript={handleVoiceTranscript}
                        disabled={isTyping || isTypingTranscript}
                      />

                      <Popover open={workflowMenuOpen} onOpenChange={setWorkflowMenuOpen}>
                        <PopoverTrigger asChild>
                          <Button type="button" size="sm" variant="ghost" 
                            className="h-8 w-8 flex-shrink-0 text-foreground hover:text-white hover:bg-mezin"
                            aria-label="Choisir un mode">
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
                        style={{ minHeight: '44px', maxHeight: '200px', height: '50px' }}
                      />

                      <Button onClick={handleStartNewChat} size="icon" 
                        className="h-10 w-10 flex-shrink-0 rounded-full bg-accent hover:bg-mezin text-white hover:text-white transition-colors" 
                        disabled={isTyping || !message.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
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