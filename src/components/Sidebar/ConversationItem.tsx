
import React, { useState, useRef, useEffect } from 'react';
import { useChatStore, Conversation } from '@/store/chatStore';
import { MessageSquare, Edit, Trash, MoreVertical, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    activeConversationId, 
    setActiveConversationId, 
    updateConversationTitle, 
    deleteConversation,
    moveConversationToFolder,
    folders
  } = useChatStore();

  const isActive = activeConversationId === conversation.id;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setTitle(conversation.title);
  }, [conversation.title]);

  const handleRename = () => {
    if (title.trim() && title !== conversation.title) {
      updateConversationTitle(conversation.id, title.trim());
      toast.success('Conversation renommée');
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteConversation(conversation.id);
    toast.success('Conversation supprimée');
  };

  const handleMoveToFolder = (folderId: string | null) => {
    moveConversationToFolder(conversation.id, folderId);
    const folderName = folderId ? folders.find(f => f.id === folderId)?.name : 'Conversations';
    toast.success(`Conversation déplacée dans "${folderName}"`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('conversation_id', conversation.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "flex items-center justify-between px-2 py-2 mb-1 rounded-md group",
        isActive 
          ? "bg-secondary text-primary" 
          : "hover:bg-secondary/80 cursor-pointer"
      )}
      onClick={() => !isEditing && setActiveConversationId(conversation.id)}
    >
      <div className="flex items-center flex-grow overflow-hidden">
        <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
        
        {isEditing ? (
          <Input 
            ref={inputRef}
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="h-7 py-0 text-sm"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-sm truncate">{conversation.title}</span>
        )}
      </div>
      
      <Popover>
        <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="w-6 h-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 opacity-100 shrink-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-1 z-50 bg-background" align="end">
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-sm" 
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-3.5 h-3.5 mr-2" />
              Renommer
            </Button>

            <div className="px-2 py-1.5">
              <div className="text-xs font-medium text-muted-foreground mb-2">Déplacer vers</div>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-start text-xs h-7 ${!conversation.folderId ? 'bg-muted text-primary' : ''}`}
                  onClick={() => handleMoveToFolder(null)}
                >
                  <FolderOpen className="h-3 w-3 mr-2" />
                  Conversations
                </Button>
                {folders.map((folder) => (
                  <Button
                    key={folder.id}
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start text-xs h-7 ${conversation.folderId === folder.id ? 'bg-muted text-primary' : ''}`}
                    onClick={() => handleMoveToFolder(folder.id)}
                  >
                    <FolderOpen className="h-3 w-3 mr-2" />
                    {folder.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="border-t pt-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-sm text-destructive hover:text-destructive hover:bg-destructive/10" 
                onClick={handleDelete}
              >
                <Trash className="w-3.5 h-3.5 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ConversationItem;
