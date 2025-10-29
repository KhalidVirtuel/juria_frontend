
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import SearchBar from './SearchBar';

interface SidebarActionsProps {
  className?: string;
}

const SidebarActions: React.FC<SidebarActionsProps> = ({ className }) => {
  const { createConversation, setActiveConversationId } = useChatStore();
  
  const handleNewConversation = () => {
    createConversation();
  };
  
  return (
    <>
      <div className="p-2">
        <Button 
          onClick={handleNewConversation} 
          className="w-full justify-start mb-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouvelle conversation
        </Button>
      </div>
      
      <SearchBar onSelectConversation={setActiveConversationId} className="mb-2" />
    </>
  );
};

export default SidebarActions;
