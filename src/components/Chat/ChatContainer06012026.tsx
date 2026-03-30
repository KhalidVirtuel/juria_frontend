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
import { VoiceRecorder } from './VoiceRecorder'; // ✅ NOUVEAU

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
  onVoiceTranscript?: (text: string) => void; // ✅ NOUVEAU
  isTypingTranscript?: boolean; // ✅ NOUVEAU
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
  onVoiceTranscript, // ✅ NOUVEAU
  isTypingTranscript = false // ✅ NOUVEAU
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setOpenDocumentId } = useDocumentModal();

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

  console.log("PTT"+ onVoiceTranscript)
  const [workflowMenuOpen, setWorkflowMenuOpen] = useState(false);
  const [activeQuickWorkflows, setActiveQuickWorkflows] = useState<Workflow[]>([]);
  const [activeModes, setActiveModes] = useState<string[]>([]);
    
  const currentConversation = conversations.find(c => c.id === activeConversationId);
  const activeWorkflows = (currentConversation as any)?.activeWorkflows || [];

  const modes = [
    { id: 'legal_assistant', name: 'Assistant Juridique', icon: Scale },
    { id: 'document_generator', name: 'Générateur de Documents', icon: FileText },
    { id: 'case_analyzer', name: 'Analyseur de Dossier', icon: Search }
  ];

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

  const handleToggleWorkflow = (workflowId: string) => {
    setActiveQuickWorkflows(prev => {
      const workflow = quickAccessWorkflows.find(w => w.id === workflowId);
      if (!workflow) return prev;
      const exists = prev.some(w => w.id === workflowId);
      return exists ? prev.filter(w => w.id !== workflowId) : [...prev, workflow];
    });
  };

  const handleRemoveQuickWorkflow = (workflowId: string) => {
    setActiveQuickWorkflows(prev => prev.filter(w => w.id !== workflowId));
  };

  const handleToggleMode = (modeId: string) => {
    setActiveModes(prev => {
      return prev.includes(modeId) ? prev.filter(m => m !== modeId) : [...prev, modeId];
    });
  };

  const handleRemoveMode = (modeId: string) => {
    setActiveModes(prev => prev.filter(m => m !== modeId));
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

  const handleRemoveActiveWorkflow = (workflowId: string) => {
    if (activeConversationId) {
      deactivateWorkflow(activeConversationId, workflowId);
      toast.success('Workflow désactivé');
    }
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
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-5xl pb-6 px-4 sm:px-6 lg:px-8 z-10">
        {(activeQuickWorkflows.length > 0 || activeModes.length > 0 || activeWorkflows.length > 0) && (
          <div className="mb-3 flex flex-wrap gap-2">
            {activeQuickWorkflows.map(workflow => {
              const IconComponent = iconMap[workflow.icon];
              return (
                <div key={workflow.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200">
                  {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                  <span className="font-medium">{workflow.title}</span>
                  <button onClick={() => handleRemoveQuickWorkflow(workflow.id)} className="ml-1 hover:bg-blue-100 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {activeModes.map(modeId => {
              const mode = modes.find(m => m.id === modeId);
              if (!mode) return null;
              const IconComponent = mode.icon;
              return (
                <div key={mode.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm border border-purple-200">
                  {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                  <span className="font-medium">{mode.name}</span>
                  <button onClick={() => handleRemoveMode(mode.id)} className="ml-1 hover:bg-purple-100 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {activeWorkflows.map((workflow: any) => (
              <div key={workflow.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm border border-green-200">
                <span className="font-medium">{workflow.name}</span>
                <button onClick={() => handleRemoveActiveWorkflow(workflow.id)} className="ml-1 hover:bg-green-100 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="relative max-w-4xl mx-auto">
          
          <div className="relative liquid-glass-container">
            <div className="relative flex items-start gap-2 p-2 pt-0">
              <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFilesSelected} />
              
              <Button type="button" onClick={handleOpenUpload} size="icon" variant="ghost" 
                className="h-10 w-10 flex-shrink-0 self-end text-foreground hover:text-primary hover:bg-muted/40">
                <Plus className="h-5 w-5" />
              </Button>

              {/* ✅ NOUVEAU : Micro PTT */}
              {onVoiceTranscript && (
                <VoiceRecorder 
                  onTranscript={onVoiceTranscript}
                  disabled={isTyping || isTypingTranscript}
                />
              )}

              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="Maître, comment puis-je vous aider ? chatcontainer"
                rows={1}
                className="flex-1 bg-transparent text-foreground placeholder-muted-foreground/70 outline-none text-lg py-3 px-2 rounded-2xl border-0 resize-none overflow-hidden focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                onKeyDown={handleKeyDown}
                disabled={isTyping || isTypingTranscript}
                style={{ minHeight: '44px', maxHeight: '200px' }}
              />

              <Button onClick={onSendMessage} size="icon" 
                className="h-10 w-10 flex-shrink-0 self-end rounded-full bg-accent hover:bg-mezin text-mezin hover:text-white transition-colors" 
                disabled={isTyping || !inputValue.trim()}>
                <Send className="h-5 w-5" />
              </Button>

              <Popover open={workflowMenuOpen} onOpenChange={setWorkflowMenuOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" size="icon" variant="ghost" 
                    className="h-10 w-10 flex-shrink-0 self-end text-foreground hover:text-primary hover:bg-muted/40">
                    <LayoutGrid className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4">
                    <h3 className="font-semibold mb-3 text-sm">Workflows Rapides</h3>
                    <div className="space-y-1.5">
                      {quickAccessWorkflows.map(workflow => {
                        const IconComponent = iconMap[workflow.icon];
                        const isActive = activeQuickWorkflows.some(w => w.id === workflow.id);
                        
                        return (
                          <button key={workflow.id} onClick={() => handleToggleWorkflow(workflow.id)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-colors ${
                              isActive ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'hover:bg-muted'
                            }`}>
                            <div className="flex items-center gap-2.5">
                              {IconComponent && <IconComponent className="w-4 h-4" />}
                              <span className="font-medium">{workflow.title}</span>
                            </div>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <h3 className="font-semibold mb-3 text-sm">Modes Assistants</h3>
                      <div className="space-y-1.5">
                        {modes.map(mode => {
                          const IconComponent = mode.icon;
                          const isActive = activeModes.includes(mode.id);
                          
                          return (
                            <button key={mode.id} onClick={() => handleToggleMode(mode.id)}
                              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-colors ${
                                isActive ? 'bg-purple-50 text-purple-700 hover:bg-purple-100' : 'hover:bg-muted'
                              }`}>
                              <div className="flex items-center gap-2.5">
                                {IconComponent && <IconComponent className="w-4 h-4" />}
                                <span className="font-medium">{mode.name}</span>
                              </div>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;