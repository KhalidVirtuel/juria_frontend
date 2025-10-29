import React, { useEffect } from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/store/chatStore';
import { useFolders } from '@/hooks/useFolders';
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
  const { activeConversationId, activeFolderId, setActiveFolderId } = useChatStore();
  const { folders } = useFolders();
  const { signOut } = useAuth();

  const activeFolder = activeFolderId ? folders.find(f => f.id === activeFolderId) : null;
  
  // Convert Supabase folder to store folder type
  const storeFolderFromSupabase = activeFolder ? {
    id: activeFolder.id,
    name: activeFolder.name,
    description: activeFolder.description || undefined,
    color: activeFolder.color,
    createdAt: new Date(activeFolder.created_at).getTime(),
    attachments: [],
    timeline: [],
    documents: [],
    deadlines: []
  } : null;

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'chat':
        return (
          <div className="flex h-full">
            <LeftSidebar />
            <main className="flex-1 overflow-hidden">
              {storeFolderFromSupabase ? (
                <FolderDetailView 
                  folder={storeFolderFromSupabase} 
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
        return <CalendarSection />;
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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-background via-background to-secondary/30 text-foreground">
      {/* Bouton Profil - fixé en haut à droite */}
      <Button
        variant="ghost"
        size="icon"
        onClick={signOut}
        className="fixed top-4 right-6 w-12 h-12 rounded-full border border-border shadow-apple-chrome z-50 transition"
        style={{ backgroundColor: '#1e3a8a' }}
      >
        <User className="h-5 w-5 text-white" />
      </Button>
      
      <FloatingClasseur activeSection={activeSection} onSectionChange={setActiveSection} />
      {renderActiveSection()}
    </div>
  );
};

export default AppLayout;