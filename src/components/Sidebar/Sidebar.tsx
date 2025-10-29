
import React, { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { cn } from '@/lib/utils';
import SidebarHeader from './SidebarHeader';
import SidebarActions from './SidebarActions';
import SidebarFolders from './SidebarFolders';
import SidebarFooter from './SidebarFooter';
import NewFolderDialog from './NewFolderDialog';
import { useFolders } from '@/hooks/useFolders';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const { createFolder } = useFolders();
  
  const { 
    setActiveConversationId
  } = useChatStore();

  const handleCreateFolder = async (name: string, description: string, color: string) => {
    await createFolder(name, description, color);
  };

  return (
    <aside className={cn("flex flex-col bg-gray-50 border-r", className)}>
      <SidebarHeader />
      
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <SidebarActions />
        
        <SidebarFolders 
          onNewFolderClick={() => setNewFolderDialogOpen(true)}
        />
        
        <SidebarFooter />
      </div>

      <NewFolderDialog 
        open={newFolderDialogOpen}
        onOpenChange={setNewFolderDialogOpen}
        onCreateFolder={handleCreateFolder}
      />
    </aside>
  );
};

export default Sidebar;
