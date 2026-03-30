import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Folder } from '@/store/types';
import { useChatStore } from '@/store/chatStore';
import { Button } from '@/components/ui/button';
import ChatSectionFolder from '../Sections/ChatSectionFolder';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { 
  MessageSquare, 
  Paperclip, 
  FileText, 
  ArrowLeft,
  MoreVertical,
  Plus,
  Send,
  MessageCircle,
  Search,
  Save,
  Sparkles,
  Brain,
  PenTool,
  ChevronRight,
  CalendarDays,
  LayoutGrid,X,ShieldCheck, Gavel, AlertTriangle, Compass, Handshake, CheckSquare, Heart, Building2, Briefcase, Home, Car, Users, Clock, ClipboardList,Scale,
  Filter,    
  SearchX    
} from 'lucide-react';



import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AttachmentList from './AttachmentList';
import TimelineView from './TimelineView';
import DocumentList from './DocumentList';
import DeadlineList from './DeadlineList';
import { sendMessageWithStreaming, StreamStep } from '@/lib/streamingApi';
import type { LoadingStep } from '../Chat/ChatLoadingSteps';
import ChatLoadingSteps from '../Chat/ChatLoadingSteps';
import { quickAccessWorkflows, Workflow } from '@/data/workflows';
import { VoiceRecorder } from '../Chat/VoiceRecorder'; // ✅ NOUVEAU
import { useTypingEffect } from '@/hooks/useTypingEffect'; // ✅ NOUVEAU
import { Input } from '@/components/ui/input';


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
  ClipboardList,
  CalendarDays
};

interface FolderDetailViewProps {
  folder: Folder;
  onBack: () => void;
  onNavigateToWorkflow?: () => void;

}

const FolderDetailView: React.FC<FolderDetailViewProps> = ({ folder, onBack,onNavigateToWorkflow}) => {
  const { 
    conversations, 
    createConversation,
    activeConversationId,
    setActiveConversationId,
    setActiveFolderId,
    isTyping,
    setIsTyping,
    deleteConversation,
    loadConversation,
    deactivateWorkflow
  } = useChatStore();
  
  const [activeTab, setActiveTab] = useState<'conversations' | 'attachments' | 'timeline' | 'documents' | 'deadlines'>('conversations');
  const [showConversationList, setShowConversationList] = useState(true);
  const [message, setMessage] = useState('');
  const [streamingSteps, setStreamingSteps] = useState<LoadingStep[]>([]);
  const [optimisticMessage, setOptimisticMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Après les states existants (activeTab, message, etc.)
  const [showFilterInput, setShowFilterInput] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [searchText, setSearchText] = useState('');

  // ✅ NOUVEAU : States pour voice PTT
  const [transcribedText, setTranscribedText] = useState('');
  const [isVoiceInput, setIsVoiceInput] = useState(false);

  
  // ✅ NOUVEAU : Hook typing animation
  const { displayedText, isTyping: isTypingTranscript } = useTypingEffect(transcribedText, 30);
  


  
  // Filtrer les conversations du dossier
  const folderConversations = conversations.filter(
    conv => String(conv.folderId) === String(folder.id)
  );

  // Vérifier si on a une conversation active du dossier
  const activeConversation = conversations.find(
    c => c.id === activeConversationId && String(c.folderId) === String(folder.id)
  );

  const safeFolder = {
    ...folder,
    attachments: folder.attachments || [],
    timeline: folder.timeline || [],
    documents: folder.documents || [],
    deadlines: folder.deadlines || []
  };

  // ✅ Callback appelé quand l'animation typing est terminée
  const handleTypingComplete = useCallback(() => {
    console.log('✅ [FOLDER-DETAIL] Typing animation complete, setting isTyping to false');
    setIsTyping(false);
  }, [setIsTyping]);



  // Filtrer et rechercher dans les conversations
  const filteredConversations = React.useMemo(() => {
    let result = folderConversations;
    
    // Filtre par titre (recherche dans le titre uniquement)
    if (filterText.trim()) {
      const filterLower = filterText.toLowerCase();
      result = result.filter(conv => 
        conv.title.toLowerCase().includes(filterLower)
      );
    }
    
    // Recherche dans le contenu des messages
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(conv => {
        // Rechercher dans le titre
        if (conv.title.toLowerCase().includes(searchLower)) {
          return true;
        }
        // Rechercher dans les messages
        return conv.messages?.some(msg => 
          msg.content.toLowerCase().includes(searchLower)
        );
      });
    }
    
    return result;
  }, [folderConversations, filterText, searchText]);


  // ✅ NOUVEAU : Auto-send après animation typing
  useEffect(() => {
    if (displayedText && !isTypingTranscript) {
      const textToSend = displayedText.trim();
      setMessage(displayedText);
      setTranscribedText('');
      
      if (textToSend) {
        console.log('🚀 Auto-envoi après animation typing:', textToSend);
        setTimeout(() => {
          handleSendFirstMessage();
        }, 500);
      }
    }
  }, [displayedText, isTypingTranscript]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

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

  // Créer une conversation et envoyer le premier message avec streaming
  const handleSendFirstMessage = async () => {
    const messageToSend = message.trim();
    if (!messageToSend || isTyping) return;

    console.log('🎬 [FOLDER-CHAT] Starting new chat in folder...', { 
      messageToSend, 
      folderId: folder.id 
    });

    // Vider le message AVANT de commencer
    setMessage('');
    
    // 🆕 Afficher le message utilisateur IMMÉDIATEMENT
    setOptimisticMessage(messageToSend);
    
    setIsTyping(true);
    console.log('🔄 [FOLDER-CHAT] isTyping set to TRUE');
    
    setStreamingSteps([]);
    console.log('🧹 [FOLDER-CHAT] streamingSteps cleared');

    try {
      // Créer une conversation dans le dossier
      const newConvId = await createConversation(String(folder.id));
      if (!newConvId) {
        throw new Error('Failed to create conversation');
      }
      
      console.log('✅ [FOLDER-CHAT] Conversation created:', newConvId);
      
      // 🔄 NE PAS switcher tout de suite - attendre la fin du streaming !
      // setActiveConversationId(newConvId);
      // setActiveFolderId(null);
      // setShowConversationList(false);

      console.log('📡 [FOLDER-CHAT] Calling sendMessageWithStreaming...');

      // Utiliser le streaming pour envoyer le message
      await sendMessageWithStreaming(
        newConvId,
        messageToSend,
        (step: StreamStep) => {
          console.log('🔔 [FOLDER-CHAT] Step callback received:', step);
          
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
            console.log('✨ [FOLDER-CHAT] Mapping step to UI:', step.step);
            
            setStreamingSteps(prev => {
              const newStep = stepMap[step.step] as LoadingStep;
              const existing = prev.find(s => s.id === newStep.id);
              
              let updated;
              if (existing) {
                updated = prev.map(s => s.id === newStep.id ? { ...s, ...newStep } : s);
              } else {
                updated = [...prev, newStep];
              }
              
              console.log('📝 [FOLDER-CHAT] Updated steps:', updated.length);
              return updated;
            });
          }
        },
        isVoiceInput // ✅ NOUVEAU : Passer isVoiceInput
      );

      console.log('✅ [FOLDER-CHAT] Streaming complete!');

      // ⏳ ÉTAPE : Attendre 300ms pour voir la dernière étape
      await new Promise(resolve => setTimeout(resolve, 300));

      // ✨ Vider les étapes
      console.log('🧹 [FOLDER-CHAT] Clearing streaming steps...');
      setStreamingSteps([]);

      // 🔄 MAINTENANT on peut switcher vers ChatSectionFolder
      console.log('🔄 [FOLDER-CHAT] Switching to ChatSectionFolder...');
      setActiveConversationId(newConvId);
      setActiveFolderId(null);
      setShowConversationList(false);

      // 🔄 Recharger pour avoir les nouveaux messages
      console.log('🔄 [FOLDER-CHAT] Reloading conversation with new messages...');
      await loadConversation(newConvId);
      
      // 🧹 Nettoyer le message optimiste
      setOptimisticMessage(null);
      
      console.log('✅ [FOLDER-CHAT] Conversation reloaded with new messages!');
      
      // ✅ NE met PAS setIsTyping(false) ici !
      // Le callback handleTypingComplete le fera après l'animation
      
    } catch (error: any) {
      console.error('❌ [FOLDER-CHAT] Error:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi du message');
      setOptimisticMessage(null);
      setIsTyping(false); // ✅ Seulement en cas d'erreur
    } finally {
      setIsVoiceInput(false); // ✅ NOUVEAU : Reset isVoiceInput
    }
    // ✅ PAS de finally avec setIsTyping(false) !
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Maj+Entrée : retour à la ligne (comportement par défaut)
    if (e.key === 'Enter' && e.shiftKey) {
      return;
    }
    
    // Entrée seule : envoyer le message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !isTyping) {
        handleSendFirstMessage();
      }
    }
  };

  const handleDeleteConversation = (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation(convId);
    toast.success('Conversation supprimée');
  };

  const tabs = [
    { id: 'conversations' as const, label: 'Conversations', icon: MessageCircle },
    { id: 'attachments' as const, label: 'Pièces jointes', icon: Paperclip },
    { id: 'timeline' as const, label: 'Chronologie', icon: Clock },
    { id: 'documents' as const, label: 'Documents', icon: FileText },
    { id: 'deadlines' as const, label: 'Échéances', icon: CalendarDays },
  ];


  const [workflowMenuOpen, setWorkflowMenuOpen] = useState(false);
  const [activeQuickWorkflows, setActiveQuickWorkflows] = useState<Workflow[]>([]);
  const [activeModes, setActiveModes] = useState<string[]>([]);
    
 const currentConversation = conversations.find(c => c.id === activeConversationId);
 console.log(currentConversation)
  const activeWorkflows = (currentConversation as any)?.activeWorkflows || [];
 console.log(activeWorkflows)

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
      const displayWorkflows = quickAccessWorkflows;
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
  
            const removeMode = (modeId: string) => {
            setActiveModes(prev => prev.filter(m => m !== modeId));
          };
  
        const removeWorkflow = (workflowId: string) => {
          if (activeConversationId) {
            deactivateWorkflow(activeConversationId, workflowId);
          }
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
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-200">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="rounded-full hover:bg-mezin"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-start">
          <h1 className="text-xl font-semibold text-mezin">{folder.name}</h1>
          {folder.description && (
            <p className="text-sm text-mezin mt-0.5">{folder.description}</p>
          )}
        </div>
        {/* Tabs Navigation */}
        <div className="flex-1 px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 my-3 py-3 text-sm font-medium border transition-colors relative",
                    isActive
                      ? "text-mezin border-mezin bg-white hover:bg-mezin hover:text-white"
                      : "text-mezin border-transparent bg-white hover:bg-mezin hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden pt-5 border-gray-200">
        {activeTab === 'conversations' && (
          <Card className="h-full flex flex-col border-none shadow-none mx-auto">
             
            <CardHeader className="flex-row items-center justify-end pb-4 px-10">
              <CardTitle className="text-lg">
                    {/* Bouton Filtrer */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowFilterInput(!showFilterInput);
                        setShowSearchInput(false);
                        if (!showFilterInput) {
                          setFilterText('');
                        }
                      }}
                      className={cn(
                        "h-9 w-9 rounded-full transition-colors",
                        showFilterInput 
                          ? "bg-blue-100 text-blue-600 hover:bg-blue-200" 
                          : "hover:bg-gray-100"
                      )}
                      title="Filtrer par titre"
                    >
                      <Filter className="w-5 h-5" />
                    </Button>
                    {/* Bouton Rechercher */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowSearchInput(!showSearchInput);
                        setShowFilterInput(false);
                        if (!showSearchInput) {
                          setSearchText('');
                        }
                      }}
                      className={cn(
                        "h-9 w-9 rounded-full transition-colors",
                        showSearchInput 
                          ? "bg-purple-100 text-purple-600 hover:bg-purple-200" 
                          : "hover:bg-gray-100"
                      )}
                      title="Rechercher dans le contenu"
                    >
                      <Search className="w-5 h-5" />
                    </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-auto">
              {showConversationList ? (
                <div className="h-full flex flex-col">
                  {/* ✅ NOUVEAU : Input Filtrer */}
                    {showFilterInput && (
                      <div className="px-6 py-3 border-b border-gray-200 bg-blue-50 animate-fade-in">
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="Filtrer par titre de conversation..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="pr-10"
                            autoFocus
                          />
                          {filterText && (
                            <button
                              onClick={() => setFilterText('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
                            >
                              <X className="w-4 h-4 text-gray-500" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                          {filteredConversations.length} conversation(s) trouvée(s)
                        </p>
                      </div>
                    )}
                    
                    {/* ✅ NOUVEAU : Input Rechercher */}
                    {showSearchInput && (
                      <div className="px-6 py-3 border-b border-gray-200 bg-purple-50 animate-fade-in">
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="Rechercher dans les messages..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="pr-10"
                            autoFocus
                          />
                          {searchText && (
                            <button
                              onClick={() => setSearchText('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
                            >
                              <X className="w-4 h-4 text-gray-500" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-purple-600 mt-2">
                          {filteredConversations.length} conversation(s) trouvée(s)
                        </p>
                      </div>
                    )}
                  {/* Liste des conversations */}
                  <div className="flex-1 overflow-auto">
                    {filteredConversations.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {filteredConversations.map((conversation) => (
                          <div
                            key={conversation.id}
                            onClick={() => {
                              setActiveFolderId(null);
                              setActiveConversationId(conversation.id);
                            }}
                            className="group px-6 py-2 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between"
                          >
                            <div className="min-w-0">
                              <h3 className="flex flex-start items-center text-sm font-normal text-mezin hover:text-blue-700 truncate flex-1">
                                <span>{conversation.title}</span>
                              </h3>
                            </div>
                            
                            <Popover>
                              <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                >
                                  <MoreVertical className="w-4 h-4 text-gray-400" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-48 p-1" align="end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                                >
                                  Supprimer
                                </Button>
                              </PopoverContent>
                            </Popover>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center px-6">
                        <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="text-base font-medium text-gray-900 mb-2">
                          Aucune conversation
                        </h3>
                        <p className="text-sm text-gray-500">
                          Commencez une nouvelle conversation ci-dessous
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 🆕 Affichage des étapes de streaming */}
                  {isTyping && streamingSteps.length > 0 && optimisticMessage && (
                    <div className="pb-4">
                      <div className="mx-auto">
                        {/* Message optimiste */}
                        <div className="mb-4 flex justify-end">
                          <div className="bg-slate-100 text-mezin rounded-2xl px-4 py-3 max-w-[80%]">
                            <p className="text-sm">{optimisticMessage}</p>
                          </div>
                        </div>
                        {/* Steps */}
                        <ChatLoadingSteps steps={streamingSteps} />
                      </div>
                    </div>
                  )}

                  {/* Champ de saisie en bas */}
                  <div className="p-6">
                    <div className="mx-auto">
                       {allActiveTags > 0 && renderActiveTagsInInput()}
                      <div className="relative liquid-glass-container">
                        <div className="relative flex items-start gap-2 px-2 py-1">
                          <input
                              ref={fileInputRef}
                              type="file"
                              className="hidden"
                              multiple
                              onChange={handleFilesSelected}
                            />
                            <Button
                              type="button"
                              onClick={handleOpenUpload}
                              size="icon"
                              variant="ghost"
                              className="h-10 w-10 flex-shrink-0 self-center text-foreground hover:text-white hover:bg-mezin"
                              aria-label="Uploader des éléments"
                            >
                              <Plus className="h-5 w-5" />
                            </Button>

                             {/* ✅ NOUVEAU : Micro PTT */}
                            <VoiceRecorder 
                              onTranscript={handleVoiceTranscript}
                              disabled={isTyping || isTypingTranscript}
                            />

                             {/* Workflow Mode Selector */}
                            <Popover open={workflowMenuOpen} onOpenChange={setWorkflowMenuOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 flex-shrink-0 self-center text-foreground hover:text-white hover:bg-mezin"
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
                              value={isTypingTranscript ? displayedText : message}
                              onChange={(e) => {
                                if (!isTypingTranscript) {
                                  setMessage(e.target.value);
                                  setIsVoiceInput(false); // ✅ Reset si typing manuel
                                }
                              }}
                              placeholder="Nouvelle conversation dans cette affaire..."
                              rows={1}
                              className="flex-1 bg-transparent text-foreground placeholder-muted-foreground/70 outline-none text-lg py-3 px-2 rounded-2xl border-0 resize-none overflow-hidden focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                              onKeyDown={handleKeyDown}
                              disabled={isTyping || isTypingTranscript}
                               style={{ minHeight: '44px', maxHeight: '200px', height: '50px'  }}
                            />
                            <Button
                            onClick={handleSendFirstMessage}
                            size="icon"
                            className="h-10 w-10 flex-shrink-0 self-center rounded-full bg-accent hover:bg-mezin text-accent-foreground"
                            disabled={isTyping || !message.trim()}
                          >
                            <Send className="h-4 w-4" />
                          </Button>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  <ChatSectionFolder 
                    folderId={Number(folder.id)} 
                    streamingSteps={streamingSteps}
                    externalOptimisticMessage={optimisticMessage}
                    onTypingComplete={handleTypingComplete}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'attachments' && (
          <div className="h-full overflow-auto mx-auto border-none shadow-none">
            <AttachmentList folderId={safeFolder.id} attachments={safeFolder.attachments} />
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="h-full overflow-auto  mx-auto border-none shadow-none">
            <TimelineView folderId={safeFolder.id} timeline={safeFolder.timeline} />
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="h-full overflow-auto  mx-auto border-none shadow-none">
            <DocumentList folderId={safeFolder.id} documents={safeFolder.documents}   onNavigateToConversations={() => setActiveTab('conversations')}  />
          </div>
        )}

        {activeTab === 'deadlines' && (
          <div className="h-full overflow-auto  mx-auto border-none shadow-none">
            <DeadlineList folderId={safeFolder.id} deadlines={safeFolder.deadlines} />
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderDetailView;