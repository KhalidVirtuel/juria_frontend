import React, { useState } from 'react';
import { MessageSquarePlus, FolderOpen, ChevronRight, ChevronDown, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatStore } from '@/store/chatStore';

interface WorkflowDestinationPickerProps {
  onSelectNewConversation: (folderId?: string) => void;
  onSelectExistingConversation: (conversationId: string) => void;
  children: React.ReactNode;
}

const WorkflowDestinationPicker: React.FC<WorkflowDestinationPickerProps> = ({
  onSelectNewConversation,
  onSelectExistingConversation,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const { folders, conversations } = useChatStore();

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleNewConversation = (folderId?: string) => {
    setOpen(false);
    onSelectNewConversation(folderId);
  };

  const handleExistingConversation = (convId: string) => {
    setOpen(false);
    onSelectExistingConversation(convId);
  };

  // Get conversations without folder
  const standaloneConversations = conversations.filter(c => !c.folderId);

  // Get conversations by folder
  const getConversationsForFolder = (folderId: string) => {
    return conversations.filter(c => c.folderId === folderId);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-white border border-border shadow-lg z-50" 
        align="start"
        sideOffset={8}
      >
        <div className="p-3 border-b border-border">
          <h4 className="font-semibold text-sm text-foreground">Où utiliser ce workflow ?</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Choisissez une destination pour activer ce workflow
          </p>
        </div>

        <ScrollArea className="max-h-80">
          <div className="p-2">
            {/* New conversation option */}
            <button
              onClick={() => handleNewConversation()}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquarePlus className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Nouvelle conversation</p>
                <p className="text-xs text-muted-foreground">Démarrer une nouvelle conversation</p>
              </div>
            </button>

            {/* Divider */}
            {(folders.length > 0 || standaloneConversations.length > 0) && (
              <div className="my-2 border-t border-border" />
            )}

            {/* Folders with their conversations */}
            {folders.map(folder => {
              const folderConversations = getConversationsForFolder(folder.id);
              const isExpanded = expandedFolders.includes(folder.id);

              return (
                <div key={folder.id}>
                  <button
                    onClick={() => toggleFolder(folder.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-6 h-6 rounded flex items-center justify-center">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <FolderOpen className="w-4 h-4" style={{ color: folder.color || '#003878' }} />
                    <span className="text-sm font-medium text-foreground flex-1 truncate">
                      {folder.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {folderConversations.length}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="ml-8 space-y-1">
                      {/* New conversation in this folder */}
                      <button
                        onClick={() => handleNewConversation(folder.id)}
                        className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-primary/10 transition-colors text-left"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm text-primary font-medium">
                          Nouvelle conversation
                        </span>
                      </button>
                      
                      {folderConversations.map(conv => (
                        <button
                          key={conv.id}
                          onClick={() => handleExistingConversation(conv.id)}
                          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm text-foreground truncate flex-1">
                            {conv.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Standalone conversations */}
            {standaloneConversations.length > 0 && (
              <>
                {folders.length > 0 && (
                  <div className="my-2 border-t border-border" />
                )}
                <p className="px-2 py-1 text-xs text-muted-foreground font-medium">
                  Conversations récentes
                </p>
                {standaloneConversations.slice(0, 5).map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => handleExistingConversation(conv.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground truncate">
                      {conv.title}
                    </span>
                  </button>
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default WorkflowDestinationPicker;
