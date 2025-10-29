import React, { useState } from 'react';
import { User, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FloatingClasseur from '../Navigation/FloatingClasseur';

interface TopBarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ activeSection, onSectionChange }) => {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="h-16 apple-glass border-b border-white/20 backdrop-blur-2xl flex items-center px-6 z-40">
      <div className="flex items-center gap-4">
        {/* Profile Button */}
        <Button
          variant="ghost"
          className="p-3 apple-button-glass hover:apple-glow transition-all duration-200"
          onClick={() => setProfileOpen(!profileOpen)}
        >
          <div className="p-1.5 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-600/30 backdrop-blur-sm">
            <User className="h-4 w-4 text-white/80" />
          </div>
        </Button>

        {/* Classeur Button */}
        <FloatingClasseur 
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          variant="topbar"
        />
      </div>
    </header>
  );
};

export default TopBar;