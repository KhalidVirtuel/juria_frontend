import React, { useState, useRef, useEffect, useCallback } from 'react'; // ✅ Ajoute useCallback
import { Plus, Send, Search, FileText, PenTool, Brain, MessageSquare, Save, Sparkles, LayoutGrid, ChevronRight,X,ShieldCheck, Gavel, AlertTriangle, Compass, Handshake, CheckSquare, Heart, Building2, Briefcase, Home, Car, Users, Clock, ClipboardList,Scale } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import ChatContainer from '../Chat/ChatContainer';
import ChatSectionFolder from '../Sections/ChatSectionFolder';
import { useChatStore } from '@/store/chatStore';
import { sendMessageWithStreaming, StreamStep } from '@/lib/streamingApi';
import type { LoadingStep } from '../Chat/ChatLoadingSteps';
import { quickAccessWorkflows, Workflow } from '@/data/workflows';
import mizenIcon from '@/assets/mizen-icon.png';

// Icon map for workflow icons
const iconMap: Record<string, React.ElementType> = {
  Brain,
  ShieldCheck,
  Gavel,
  AlertTriangle,
  Compass,
  PenTool,
  Handshake,
  CheckSquare,
  FileText,
  Heart,
  Building2,
  Briefcase,
  Home,
  Car,
  Users,
  Scale,
  Search,
  Clock,
  ClipboardList
};

interface ChatSectionProps {
  onNavigateToWorkflow?: () => void;
}

const ChatSection = ({ onNavigateToWorkflow }: ChatSectionProps): JSX.Element => {
  const [message, setMessage] = useState('');
  const [streamingSteps, setStreamingSteps] = useState<LoadingStep[]>([]);
  const [optimisticMessage, setOptimisticMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [workflowMenuOpen, setWorkflowMenuOpen] = useState(false);
  const [activeQuickWorkflows, setActiveQuickWorkflows] = useState<Workflow[]>([]);
  const [activeModes, setActiveModes] = useState<string[]>([]);


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


 const currentConversation = conversations.find(c => c.id === activeConversationId);
  const messages = currentConversation?.messages || [];
  const activeWorkflows = (currentConversation as any)?.activeWorkflows || [];
    const modes = [
    { id: 'analyser', label: 'Analyser', icon: Search },
    { id: 'generer', label: 'Générer', icon: PenTool },
    { id: 'evaluer', label: 'Évaluer', icon: Scale },
  ];

  const toggleMode = (modeId: string) => {
    setActiveModes(prev => 
      prev.includes(modeId) 
        ? prev.filter(m => m !== modeId)
        : [...prev, modeId]
    );
  };

  const displayMessages = optimisticMessage 
    ? [...messages, { 
        id: 'optimistic',
        conversationId: activeConversationId || '',
        content: optimisticMessage, 
        role: 'user' as const,
        createdAt: new Date().toISOString(),
        timestamp: Date.now(),
        sources: []
      }]
    : messages;
  
  const isFromFolder = currentConversation?.folderId !== null && currentConversation?.folderId !== undefined;
  const folderId = currentConversation?.folderId;

  // ✅ Utilise useCallback pour stabiliser la fonction
  const handleTypingComplete = useCallback(() => {
    console.log('✅ [CHAT] Typing animation complete, setting isTyping to false');
    setIsTyping(false);
  }, [setIsTyping]); // ✅ Dépend seulement de setIsTyping

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleOpenUpload = () => fileInputRef.current?.click();
  // Use centralized workflow data
  const displayWorkflows = quickAccessWorkflows;

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    toast.success(`${files.length} fichier(s) sélectionné(s)`);
  };

    const removeMode = (modeId: string) => {
    setActiveModes(prev => prev.filter(m => m !== modeId));
  };

  const removeWorkflow = (workflowId: string) => {
    if (activeConversationId) {
      deactivateWorkflow(activeConversationId, workflowId);
    }
  };

  const handleStartNewChat = async () => {
    const messageToSend = message.trim();
    if (!messageToSend) return;

    console.log('🎬 [CHAT] Starting new chat...', { messageToSend });
    
    setMessage('');
    setOptimisticMessage(messageToSend);
    setIsTyping(true);
    console.log('🔄 [CHAT] isTyping set to TRUE');
    setStreamingSteps([]);

    try {
      let conversationId = activeConversationId;
      
      if (!conversationId) {
        conversationId = await createConversation();
        if (!conversationId) {
          throw new Error('Failed to create conversation');
        }
        setActiveConversationId(conversationId);
      }

      console.log('✅ [CHAT] Conversation ID:', conversationId);
      await loadConversation(conversationId);
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log('📡 [CHAT] Starting streaming...');

      await sendMessageWithStreaming(
        conversationId,
        messageToSend,
        (step: StreamStep) => {
          const stepMap: Record<string, Partial<LoadingStep>> = {
            saving_user: { 
              id: 'save_user', 
              icon: <Save className="w-5 h-5" />, 
              message: 'Enregistrement de votre question...', 
              status: 'loading' 
            },
            searching: { 
              id: 'search', 
              icon: <Search className="w-5 h-5" />, 
              message: 'Recherche dans la base de connaissances...', 
              details: step.details,
              status: 'loading' 
            },
            documents_found: { 
              id: 'docs', 
              icon: <FileText className="w-5 h-5" />, 
              message: step.message || 'Documents trouvés', 
              details: step.details,
              status: 'complete' 
            },
            no_documents: { 
              id: 'docs', 
              icon: <FileText className="w-5 h-5" />, 
              message: 'Utilisation des connaissances générales',
              details: step.details,
              status: 'complete' 
            },
            rag_error: {
              id: 'docs',
              icon: <FileText className="w-5 h-5" />,
              message: step.message || 'Utilisation du modèle de base',
              status: 'complete'
            },
            generating: { 
              id: 'generate', 
              icon: <Sparkles className="w-5 h-5" />, 
              message: 'Génération de la réponse...', 
              details: step.details,
              status: 'loading' 
            },
            saving_timeline: {
              id: 'timeline',
              icon: <MessageSquare className="w-5 h-5" />,
              message: step.message || 'Création des événements...',
              status: 'loading'
            },
            saving_documents: {
              id: 'documents',
              icon: <FileText className="w-5 h-5" />,
              message: step.message || 'Création des documents...',
              status: 'loading'
            },
            complete: { 
              id: 'complete_step', 
              icon: <Sparkles className="w-5 h-5" />, 
              message: 'Réponse générée avec succès', 
              status: 'complete' 
            },
          };

          if (step.step && stepMap[step.step]) {
            setStreamingSteps(prev => {
              const newStep = stepMap[step.step] as LoadingStep;
              const existing = prev.find(s => s.id === newStep.id);
              
              if (existing) {
                return prev.map(s => s.id === newStep.id ? { ...s, ...newStep } : s);
              } else {
                return [...prev, newStep];
              }
            });
          }
        }
      );

      
      console.log('✅ [CHAT] Streaming complete!');
      await new Promise(resolve => setTimeout(resolve, 300));
      setStreamingSteps([]);

      console.log('🔄 [CHAT] Reloading conversation...');
      await loadConversation(conversationId);
      setOptimisticMessage(null);
      
      // ✅ NE met PAS setIsTyping(false) ici !

    } catch (error: any) {
      console.error('❌ [CHAT] Error:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi du message');
      setOptimisticMessage(null);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) return;
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !isTyping) {
        handleStartNewChat();
      }
    }
  };

  const hasMessages = messages.length > 0;
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

  // Calculate total active tags including quick workflows
  const allActiveTags = activeModes.length + activeWorkflows.length + activeQuickWorkflows.length;

  const renderActiveTagsInInput = () => {
    if (allActiveTags === 0) return null;
    
    return (
      <div className="flex items-start gap-2 mb-3 flex-wrap pl-12">
        {/* Workflow tags */}
        {activeWorkflows.map(workflow => {
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


  return (
    <div className="h-full">
      {isFromFolder && folderId ? (
        <ChatSectionFolder folderId={Number(folderId)} />
      ) : (
        <>
          {hasMessages || activeConversationId || optimisticMessage ? (
            <div className="animate-fade-in">
              <ChatContainer
                messages={displayMessages}
                isTyping={isTyping}
                onSendMessage={handleStartNewChat} 
                inputValue={message}
                onInputChange={setMessage}
                streamingSteps={streamingSteps}
                onTypingComplete={handleTypingComplete}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-8 bg-white animate-fade-in">
              <div className="flex justify-center animate-fade-in mb-8">
                    <img 
                      src={mizenIcon} 
                      alt="Mizen" 
                      className="h-24 w-auto animate-scale-in"
                      style={{ animationDuration: '0.6s', animationDelay: '0.1s', animationFillMode: 'backwards' }}
                    />
              </div>
              <div className="w-full max-w-2xl mx-auto text-center">
                <div className="relative max-w-3xl mx-auto mb-2">
                  {allActiveTags > 0 && renderActiveTagsInInput()}
                  <div className="relative liquid-glass-container mt-5">
                  
                    <div className="relative flex items-start gap-2 py-1 px-2">
                      <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFilesSelected} />
                      <Button 
                        type="button" 
                        onClick={handleOpenUpload} 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 flex-shrink-0 self-center text-foreground hover:text-primary hover:bg-muted/40"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                      {/* Workflow Mode Selector */}
                      <Popover open={workflowMenuOpen} onOpenChange={setWorkflowMenuOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 flex-shrink-0 self-center text-foreground hover:text-primary hover:bg-muted/40"
                            aria-label="Choisir un mode"
                          >
                            <LayoutGrid className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-64 p-2" 
                          align="start"
                          side="top"
                          sideOffset={8}
                        >
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground px-2 py-1">Modes de travail</p>
                            {displayWorkflows.slice(0, 5).map((workflow) => {
                              const IconComponent = iconMap[workflow.icon] || Brain;
                              const isActive = activeQuickWorkflows.some(w => w.id === workflow.id);
                              return (
                                <button
                                  key={workflow.id}
                                  onClick={() => {
                                    toggleQuickWorkflow(workflow);
                                    setWorkflowMenuOpen(false);
                                  }}
                                  className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-left transition-colors ${
                                    isActive 
                                      ? 'bg-[#003878] text-white' 
                                      : 'hover:bg-muted text-foreground'
                                  }`}
                                >
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
                              <button
                                onClick={() => {
                                  setWorkflowMenuOpen(false);
                                  onNavigateToWorkflow?.();
                                }}
                                className="w-full flex items-center justify-between px-2 py-2 rounded-md text-left hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <span className="text-sm">Voir tous les workflows</span>
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Maître, comment puis-je vous aider ?"
                        rows={1}
                        className="flex-1 bg-transparent text-foreground placeholder-muted-gray/70 outline-none text-lg py-3 px-2 rounded-2xl border-0 resize-none overflow-hidden focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                        onKeyDown={handleKeyDown}
                        disabled={isTyping}
                        style={{ minHeight: '44px', maxHeight: '200px', height: '50px'  }}
                      />

                      <Button 
                        onClick={handleStartNewChat}
                        size="icon" 
                        className="h-10 w-10 flex-shrink-0 self-center rounded-full bg-accent hover:bg-mezin text-accent-foreground" 
                        disabled={isTyping || !message.trim()}
                      >
                        <Send className="h-5 w-5" />
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