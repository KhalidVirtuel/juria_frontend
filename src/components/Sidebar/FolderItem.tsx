
import React, { useState, useRef, useEffect } from 'react';
import { useChatStore, Folder, Conversation } from '@/store/chatStore';
import { Folder as FolderIcon, Edit, Trash, ChevronDown, ChevronRight, MoreVertical, PlusCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import ConversationItem from './ConversationItem';
import { cn } from '@/lib/utils';

interface FolderItemProps {
  folder: Folder;
  conversations: Conversation[];
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, conversations }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(folder.name);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { updateFolderName, deleteFolder, createConversation, moveConversationToFolder, setActiveFolderId } = useChatStore();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setName(folder.name);
  }, [folder.name]);

  const handleRename = () => {
    updateFolderName(folder.id, name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    }
  };

  // Create a new conversation in this folder
  const handleCreateConversation = (e: React.MouseEvent) => {
    e.stopPropagation();
    createConversation(folder.id);
    
    // Make sure the folder is open to show the new conversation
    if (!isOpen) {
      setIsOpen(true);
    }

    toast({
      title: "Succès",
      description: `Nouvelle conversation créée dans "${folder.name}"`
    });
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const conversationId = e.dataTransfer.getData('conversation_id');
    if (conversationId) {
      moveConversationToFolder(conversationId, folder.id);
      
      // Make sure the folder is open to show the dragged conversation
      if (!isOpen) {
        setIsOpen(true);
      }
    }
  };

  return (
    <div className="mb-1">
      <div 
        className={cn(
          "flex items-center justify-between px-2 py-2 rounded-md hover:bg-secondary group",
          isDragOver && "bg-secondary/90 border-2 border-dashed border-jure"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div 
          className="flex items-center flex-grow cursor-pointer" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <ChevronDown className="w-4 h-4 mr-1" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-1" />
          )}
          <FolderIcon className="w-4 h-4 mr-2 text-jure" />
          
          {isEditing ? (
            <Input 
              ref={inputRef}
              value={name} 
              onChange={(e) => setName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              className="h-7 py-0 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-sm font-medium truncate">{folder.name}</span>
          )}
        </div>

        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 mr-1"
            onClick={handleCreateConversation}
            title="Nouvelle conversation dans ce dossier"
          >
            <PlusCircle className="w-4 h-4 text-jure" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1" align="end">
              <div className="flex flex-col">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start mb-1 text-sm" 
                  onClick={() => setActiveFolderId(folder.id)}
                >
                  <Eye className="w-3.5 h-3.5 mr-2" />
                  Voir le dossier
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start mb-1 text-sm" 
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-3.5 h-3.5 mr-2" />
                  Renommer
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start text-sm text-destructive hover:text-destructive" 
                  onClick={() => deleteFolder(folder.id)}
                >
                  <Trash className="w-3.5 h-3.5 mr-2" />
                  Supprimer
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {isOpen && (
        <div className="pl-7">
          {conversations.map((conversation) => (
            <ConversationItem 
              key={conversation.id} 
              conversation={conversation} 
            />
          ))}
          {conversations.length === 0 && (
            <div className="px-2 py-2 text-xs text-muted-foreground italic">
              Aucune conversation
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FolderItem;
