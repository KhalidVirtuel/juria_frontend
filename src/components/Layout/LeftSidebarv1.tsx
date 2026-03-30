import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Folder, MessageCircle, ChevronLeft, Database, MoreVertical, Edit, Trash, FolderOpen, PlusCircle, FolderPlus, FolderInput, Calendar, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import KnowledgeBaseDialog from '../Knowledge/KnowledgeBaseDialog';
import { useConversations } from '@/hooks/useConversations';
import { useFolders } from '@/hooks/useFolders';
import NewFolderDialog from '../Sidebar/NewFolderDialog';
import { useChatStore } from '@/store/chatStore';
import { toast } from 'sonner';
import mizenLogo from '@/assets/mizenpro-ai-logo.png';

interface LeftSidebarProps {
  onSectionChange?: (section: string) => void;
}
const LeftSidebar: React.FC<LeftSidebarProps> = ({ onSectionChange }) => {
  const {
    conversations,
    currentConversation,
    createConversation,
    deleteConversation,
    selectConversation,
    moveConversationToFolder,
  } = useConversations();
  
  const {
    folders,
    loading,
    createFolder,
    deleteFolder,
  } = useFolders();
  const { setActiveFolderId, setActiveConversationId } = useChatStore();
  const [knowledgeBaseOpen, setKnowledgeBaseOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");

  const handleCreateFolder = async (name: string, description: string, color: string) => {
    setActiveFolderId(await createFolder(name, description, color));
    setActiveConversationId(null);
  };

    const navItems = [
    { 
      id: 'new-conversation', 
      label: 'Nouvelle conversation', 
      icon: PlusCircle, 
      action: () => {
        setActiveFolderId(null);
        setActiveConversationId(null);
      }
    },
    { 
      id: 'agenda', 
      label: 'Agenda', 
      icon: Calendar, 
      action: () => onSectionChange?.('calendar')
    },
    { 
      id: 'workflow', 
      label: 'Workflow', 
      icon: GitBranch, 
      action: () => onSectionChange?.('workflow')
    },
    { 
      id: 'knowledge', 
      label: 'Base de connaissances', 
      icon: Database, 
      action: () => setKnowledgeBaseOpen(true)
    },
  ];


  return (
    <aside style={{width:sidebarOpen && "260px"}} className={cn("h-full bg-slate-50 border-r border-border flex flex-col transition-all duration-300", sidebarOpen ? "w-56" : "w-12")}>
     {/* Header with logo */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {sidebarOpen && (
          <img src={mizenLogo} alt="Mizen AI" className="h-8 object-contain" />
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn("h-8 w-8 p-0 hover:bg-muted rounded-lg", !sidebarOpen && "mx-auto")}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <ChevronLeft className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", !sidebarOpen && "rotate-180")} />
        </Button>
      </div>

          {/* Navigation Items */}
      <div className={cn("border-b border-border", sidebarOpen ? "p-3" : "p-2")}>
        <div className="space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={cn(
                "w-full rounded-md hover:bg-muted transition hover:text-mezin flex items-center",
                sidebarOpen ? "justify-start px-3 h-9" : "justify-center px-2 h-9"
              )}
              onClick={item.action}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className={cn("h-4 w-4 text-foreground", sidebarOpen && "mr-2")} />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </Button>
          ))}
        </div>
      </div>

      
      
      {/* Content */}
      <ScrollArea className={cn("flex-1 transition-all duration-300", sidebarOpen ? "px-4 py-4" : "px-2 py-4")}>
        <div className="space-y-6">
          {/* Folders */}
          <div className="space-y-2">
            {sidebarOpen && (
              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-xs font-medium text-mezin uppercase tracking-wider">
                  Dossiers
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setNewFolderOpen(true)}
                >
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </div>
            )}
            {folders.length === 0 && sidebarOpen && (
              <div className="text-center py-8 text-sm text-mezin">
                Aucun dossier. Créez votre premier dossier pour organiser vos affaires.
              </div>
            )}
            {
            sidebarOpen && 
            folders.map(folder => (
              <Button 
                key={folder.id} 
                variant="ghost" 
                className={cn(
                  "w-full rounded-md hover:bg-muted hover:text-mezin transition",
                  sidebarOpen ? "justify-start p-2.5 h-auto " : "justify-center p-2 h-10 "
                )} 
                onClick={() => {
                   setActiveConversationId(null);
                   setActiveFolderId(folder.id);
                 
                }}
                title={!sidebarOpen ? folder.name : undefined}
              >
                <div className={cn("flex items-center w-full", sidebarOpen ? "gap-3" : "justify-center")}>
                  <Folder className="h-4 w-4" style={{ color: folder.color }} />
                  {sidebarOpen && (
                    <div className="flex-1 text-left">
                      <div className="font-medium  text-sm">{folder.name}</div>
                      {folder.description && (
                        <div className="text-xs truncate">
                          {folder.description}
                        </div>
                      )}
                    </div>
                  )}
                  {sidebarOpen && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="ml-1 h-6 w-6 p-0  hover:text-white hover:bg-mezin" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-1 z-50 bg-background" align="end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-sm text-destructive hover:text-destructive hover:bg-destructive/10" 
                          onClick={() => deleteFolder(folder.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </Button>
            ))}
          </div>

          {/* Recent Conversations */}
          <div className="space-y-2">
            {sidebarOpen && (
              <h3 className="text-xs font-medium text-mezin uppercase tracking-wider px-2 mb-2">
                Conversations Récentes
              </h3>
            )}
            {sidebarOpen && conversations.slice(0, 8).map(conversation => (
              <Button 
                key={conversation.id} 
                variant="ghost" 
                className={cn(
                  "w-full rounded-md hover:bg-muted hover:text-mezin transition",
                  sidebarOpen ? "justify-start p-2.5 h-auto" : "justify-center p-2 h-10",
                  currentConversation?.id === conversation.id && "bg-muted border-border"
                )} 
                onClick={() => {
                 
                  selectConversation(conversation);
                  setActiveFolderId(null);
                }}
                title={!sidebarOpen ? conversation.title : undefined}
              >
                <div className={cn("flex items-center w-full", sidebarOpen ? "gap-3" : "justify-center")}>
                  {sidebarOpen && (
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium  text-sm truncate">
                        {conversation.title}
                      </div>
                      <div className="text-xs ">
                        {new Date(conversation.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  )}

                  {sidebarOpen && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="ml-1 h-6 w-6 p-0 text-mezin hover:text-white hover:bg-mezin " 
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-1 z-50 bg-background" align="end" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          {/* Move to folder section */}
                          <div className="px-2 py-1.5">
                            <div className="text-xs font-medium text-mezin mb-2">Déplacer vers</div>
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "w-full justify-start text-xs h-7",
                                  !conversation.folder_id && "bg-muted text-primary"
                                )}
                                onClick={async () => {
                                  await moveConversationToFolder(conversation.id, null);
                                  toast.success('Conversation déplacée dans "Conversations"');
                                }}
                              >
                                <FolderInput className="h-3 w-3 mr-2" />
                                Conversations
                              </Button>
                              {folders.map((folder) => (
                                <Button
                                  key={folder.id}
                                  variant="ghost"
                                  size="sm"
                                  className={cn(
                                    "w-full justify-start text-xs h-7",
                                    conversation.folder_id === folder.id && "bg-muted text-primary"
                                  )}
                                  onClick={async () => {
                                    await moveConversationToFolder(conversation.id, folder.id);
                                    toast.success(`Conversation déplacée dans "${folder.name}"`);
                                  }}
                                >
                                  <Folder className="h-3 w-3 mr-2" style={{ color: folder.color }} />
                                  {folder.name}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* Delete button */}
                          <div className="border-t pt-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-start text-sm text-destructive hover:text-destructive hover:bg-destructive/10" 
                              onClick={() => deleteConversation(conversation.id)}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>


<KnowledgeBaseDialog open={knowledgeBaseOpen} onOpenChange={setKnowledgeBaseOpen} />
      <NewFolderDialog 
        open={newFolderOpen} 
        onOpenChange={setNewFolderOpen}
        onCreateFolder={handleCreateFolder}
      />
    </aside>
  );
};

export default LeftSidebar;