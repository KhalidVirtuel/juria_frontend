import React, { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import ChatLoadingSteps, { LoadingStep } from './ChatLoadingSteps';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Message } from '@/store/types';
import { quickAccessWorkflows, Workflow } from '@/data/workflows';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Send, Search, FileText, PenTool, Brain, MessageSquare, Save, Sparkles, LayoutGrid, ChevronRight, X, ShieldCheck, Gavel, AlertTriangle, Compass, Handshake, CheckSquare, Heart, Building2, Briefcase, Home, Car, Users, Clock, ClipboardList, Scale } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useDocumentModal } from '@/hooks/useDocumentModal';
import { VoiceRecorder } from './VoiceRecorder';

const iconMap: Record<string, React.ElementType> = {
  Brain, ShieldCheck, Gavel, AlertTriangle, Compass, PenTool, Handshake, CheckSquare,
  FileText, Heart, Building2, Briefcase, Home, Car, Users, Scale, Search, Clock, ClipboardList
};

interface ChatContainerProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: () => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  streamingSteps?: LoadingStep[];
  onTypingComplete?: () => void; 
  onNavigateToWorkflow?: () => void;
  audioData?: { audio: string; mimeType: string; voice: string } | null;
  onVoiceTranscript?: (text: string) => void;
  isTypingTranscript?: boolean;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  messages, 
  onSendMessage,
  inputValue,
  onInputChange,
  streamingSteps = [],
  onTypingComplete,
  onNavigateToWorkflow,
  audioData,
  onVoiceTranscript,
  isTypingTranscript = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setOpenDocumentId } = useDocumentModal();

  const {
    conversations,
    activeConversationId,
    deactivateWorkflow,
    isTyping,
  } = useChatStore();

  const [workflowMenuOpen, setWorkflowMenuOpen] = useState(false);
  const [activeQuickWorkflows, setActiveQuickWorkflows] = useState<Workflow[]>([]);
  const [activeModes, setActiveModes] = useState<string[]>([]);
    
  const currentConversation = conversations.find(c => c.id === activeConversationId);
  const activeWorkflows = (currentConversation as any)?.activeWorkflows || [];

  const modes = [
    { id: 'analyser', label: 'Analyser', icon: Search },
    { id: 'generer', label: 'Générer', icon: PenTool },
    { id: 'evaluer', label: 'Évaluer', icon: Scale },
  ];

  const displayWorkflows = quickAccessWorkflows;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingSteps]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isTyping) {
        onSendMessage();
      }
    }
  };

  const handleOpenUpload = () => fileInputRef.current?.click();
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    toast.success(`${files.length} fichier(s) sélectionné(s)`);
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

  const handleDocumentLinkClick = (documentId: string) => {
    console.log('📄 [CONTAINER] Opening document:', documentId);
    setOpenDocumentId(documentId);
  };

  const handleTypingComplete = () => {
    console.log('✅ [CONTAINER] Typing complete callback received');
    if (onTypingComplete) {
      onTypingComplete();
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

  return (
    <div className="flex flex-col h-screen mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex-1 overflow-y-auto space-y-6 apple-scrollbar pt-16 pb-32 px-32">
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          
          return (
            <ChatMessage 
              key={message.id} 
              message={message} 
              isLatest={isLastMessage}
              isStreaming={isTyping}
              typingSpeed="fast"
              onTypingComplete={isLastMessage ? handleTypingComplete : undefined}
              onDocumentLinkClick={handleDocumentLinkClick}
              audioData={isLastMessage ? audioData : null}
            />
          );
        })}
        
        {streamingSteps.length > 0 && (
          <ChatLoadingSteps steps={streamingSteps} />
        )}
        
        <div ref={messagesEndRef} />
      </div>
      {/* Bottom toolbar */}
      <div className=" w-full max-w-5xl pb-6 px-4 sm:px-6 lg:px-8 z-10 mx-auto">
        <div className="relative max-w-4xl mx-auto">
          {/* Tags actifs */}
          {allActiveTags > 0 && renderActiveTagsInInput()}
          
          <div className="relative liquid-glass-container">
            <div className="relative flex items-start gap-0 px-2 py-1">
              <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFilesSelected} />
              
              <Button type="button" onClick={handleOpenUpload} size="icon" variant="ghost" 
                className="h-8 w-8 flex-shrink-0 self-center text-foreground hover:text-white hover:bg-mezin">
                <Plus className="h-5 w-5" />
              </Button>

              {/* Micro PTT */}
              {onVoiceTranscript && (
                <VoiceRecorder 
                  onTranscript={onVoiceTranscript}
                  disabled={isTyping || isTypingTranscript}
                />
              )}

              {/* Workflow Mode Selector */}
              <Popover open={workflowMenuOpen} onOpenChange={setWorkflowMenuOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 flex-shrink-0 self-center text-foreground hover:text-white hover:bg-mezin"
                  >
                    <LayoutGrid className="h-5 w-5" />
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
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="Maître, comment puis-je vous aider ?"
                rows={1}
                className="flex-1 bg-transparent text-foreground placeholder-muted-foreground/70 outline-none text-lg py-3 px-2 rounded-2xl border-0 resize-none overflow-hidden focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                onKeyDown={handleKeyDown}
                disabled={isTyping || isTypingTranscript}
                style={{ minHeight: '44px', maxHeight: '200px' }}
              />

              <Button onClick={onSendMessage} size="icon" 
                className="h-10 w-10 flex-shrink-0 self-center rounded-full bg-accent hover:bg-mezin text-white hover:text-white transition-colors" 
                disabled={isTyping || !inputValue.trim()}>
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