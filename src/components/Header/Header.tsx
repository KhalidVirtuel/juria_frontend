import React, { useState } from 'react';
import { Menu, Database, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { useChatStore } from '@/store/chatStore';
import KnowledgeBaseDialog from '../Knowledge/KnowledgeBaseDialog';
interface HeaderProps {
  isMobile?: boolean;
}
const Header: React.FC<HeaderProps> = ({
  isMobile = false
}) => {
  const [knowledgeBaseOpen, setKnowledgeBaseOpen] = useState(false);
  const { toggleSidebar } = useChatStore();

  return <header className="h-14 border-b bg-white/95 backdrop-blur-sm sticky top-0 z-30 flex items-center px-4">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          {isMobile && <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>}
          <Logo size="md" />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:text-white [&>svg]:hover:text-white"
            onClick={() => setKnowledgeBaseOpen(true)}
          >
            <Database className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:text-white [&>svg]:hover:text-white"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <KnowledgeBaseDialog open={knowledgeBaseOpen} onOpenChange={setKnowledgeBaseOpen} />
    </header>;
};
export default Header;