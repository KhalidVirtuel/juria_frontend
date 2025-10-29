
import React from 'react';
import { useChatStore, Conversation } from '@/store/chatStore';
import { Button } from '@/components/ui/button';
import { FolderPlus, MessagesSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import FolderItem from './FolderItem';
import ConversationItem from './ConversationItem';

interface SidebarFoldersProps {
  onNewFolderClick: () => void;
}

const SidebarFolders: React.FC<SidebarFoldersProps> = ({ onNewFolderClick }) => {
  const { conversations, folders, moveConversationToFolder } = useChatStore();
  const [isDragOver, setIsDragOver] = React.useState(false);
  
  // Grouper les conversations par dossier
  const conversationsInFolders = conversations.filter(convo => convo.folderId !== null);
  const conversationsWithoutFolder = conversations.filter(convo => convo.folderId === null);

  // Handle drag and drop for moving conversations to "root" (no folder)
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
      moveConversationToFolder(conversationId, null);
    }
  };

  return (
    <>
      <div className="px-2 py-2">
        <div className="flex items-center justify-end mb-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-jure" 
            onClick={onNewFolderClick}
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2">
          {folders.map((folder) => (
            <FolderItem 
              key={folder.id} 
              folder={folder} 
              conversations={conversationsInFolders.filter(c => c.folderId === folder.id)} 
            />
          ))}
          
          {folders.length > 0 && conversationsWithoutFolder.length > 0 && (
            <Separator className="my-2" />
          )}

          <div 
            className={cn(
              "mb-1",
              isDragOver && "bg-secondary/80 border-2 border-dashed border-jure rounded-md"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {conversationsWithoutFolder.length > 0 && (
              <div className="flex items-center px-2 py-1">
                <MessagesSquare className="mr-2 h-4 w-4 text-jure" />
                <h3 className="text-sm font-medium text-gray-600">Conversations</h3>
              </div>
            )}
            {conversationsWithoutFolder
              .sort((a, b) => b.lastUpdated - a.lastUpdated)
              .map((conversation) => (
                <ConversationItem 
                  key={conversation.id} 
                  conversation={conversation} 
                />
              ))
            }
          </div>
        </div>
      </ScrollArea>
    </>
  );
};

export default SidebarFolders;
