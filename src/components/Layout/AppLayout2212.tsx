import React, { useEffect } from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/store/chatStore';
import { useAuth } from '@/hooks/useAuth';
import LeftSidebar from './LeftSidebar';
import FloatingClasseur from '../Navigation/FloatingClasseur';
import ChatSection from '../Sections/ChatSection';
import FolderDetailView from '../Folder/FolderDetailView';
import CasesSection from '../Sections/CasesSection';
import CalendarSection from '../Sections/CalendarSection';
import BillingSection from '../Sections/BillingSection';
import CommunicationSection from '../Sections/CommunicationSection';
import DocumentsSection from '../Sections/DocumentsSection';
import ClientsSection from '../Sections/ClientsSection';
import AnalyticsSection from '../Sections/AnalyticsSection';
import AISection from '../Sections/AISection';
import SettingsSection from '../Sections/SettingsSection';

const AppLayout: React.FC = () => {
  const [activeSection, setActiveSection] = React.useState('chat');
  const { activeConversationId, activeFolderId, setActiveFolderId, folders } = useChatStore();
  const { signOut } = useAuth();

  const activeFolder = activeFolderId ? folders.find(f => f.id === activeFolderId) : null;

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'chat':
        return (
          <div className="flex h-full">
            <LeftSidebar />
            <main className="flex-1 overflow-hidden">
              {activeFolder ? (
                <FolderDetailView
                  folder={activeFolder}
                  onBack={() => setActiveFolderId(null)}
                />
              ) : (
                <ChatSection />
              )}
            </main>
          </div>
        );
      case 'cases':
        return <CasesSection />;
      case 'calendar':
        return (
          <div className="flex h-full">
            <LeftSidebar onSectionChange={setActiveSection} />
            <main className="flex-1 overflow-hidden border-l border-border">
              <CalendarSection />
            </main>
          </div>
        );
      case 'billing':
        return <BillingSection />;
      case 'communication':
        return <CommunicationSection />;
      case 'documents':
        return <DocumentsSection />;
      case 'clients':
        return <ClientsSection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'ai':
        return <AISection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return (
          <div className="flex h-full">
            <LeftSidebar />
            <main className="flex-1 overflow-hidden">
              <ChatSection />
            </main>
          </div>
        );
    }
  };

  return (
    <div className="h-screen overflow-hidden  text-foreground">
      {/* Bouton Profil - fixé en haut à droite */}
      <Button
        variant="ghost"
        size="icon"
        onClick={signOut}
        className="fixed top-4 w-12 h-12 rounded-full border border-border shadow-apple-chrome z-50 transition"
        style={{ backgroundColor: '#1e3a8a',right:'60px' }}
      >
        <User className="h-5 w-5 text-white" />
      </Button>
      
      <FloatingClasseur activeSection={activeSection} onSectionChange={setActiveSection} />
      {renderActiveSection()}
    </div>
  );
};

export default AppLayout;
