import React, { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { 
  MessageSquare, 
  FolderOpen, 
  Calendar,
  CreditCard,
  Mail,
  FileText,
  Users,
  BarChart3,
  Brain,
  Settings,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  isActive?: boolean;
  premium?: boolean;
}

interface MainNavigationProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const MainNavigation: React.FC<MainNavigationProps> = ({ 
  activeSection = 'chat', 
  onSectionChange 
}) => {
  const { conversations, folders } = useChatStore();

  const navigationItems: NavigationItem[] = [
    {
      id: 'chat',
      label: 'Assistant IA',
      icon: MessageSquare,
      count: conversations.length,
      isActive: activeSection === 'chat',
    },
    {
      id: 'cases',
      label: 'Dossiers & Clients',
      icon: FolderOpen,
      count: folders.length,
      isActive: activeSection === 'cases',
    },
    {
      id: 'calendar',
      label: 'Agenda & Planning',
      icon: Calendar,
      isActive: activeSection === 'calendar',
    },
    {
      id: 'billing',
      label: 'Facturation',
      icon: CreditCard,
      isActive: activeSection === 'billing',
      premium: true,
    },
    {
      id: 'communication',
      label: 'Communication',
      icon: Mail,
      isActive: activeSection === 'communication',
    },
    {
      id: 'documents',
      label: 'Documents & Modèles',
      icon: FileText,
      isActive: activeSection === 'documents',
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: Users,
      isActive: activeSection === 'clients',
    },
    {
      id: 'analytics',
      label: 'Analyses & Rapports',
      icon: BarChart3,
      isActive: activeSection === 'analytics',
      premium: true,
    },
    {
      id: 'ai',
      label: 'Super-pouvoirs IA',
      icon: Brain,
      isActive: activeSection === 'ai',
      premium: true,
    },
  ];

  return (
    <nav className="flex flex-col space-y-1 p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Assistant Juridique
        </h2>
        <p className="text-sm text-muted-foreground">
          Votre cabinet numérique intelligent
        </p>
      </div>

      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.id}
            variant={item.isActive ? "default" : "ghost"}
            className={cn(
              "justify-start h-12 px-4 text-left glass-hover rounded-xl transition-all duration-300",
              item.isActive && "glass-card-premium text-primary-foreground shadow-glow",
              !item.isActive && "text-muted-foreground hover:text-foreground hover:bg-white/20"
            )}
            onClick={() => onSectionChange?.(item.id)}
          >
            <Icon className={cn(
              "w-5 h-5 mr-3 flex-shrink-0",
              item.isActive && "text-white",
              item.premium && !item.isActive && "text-primary"
            )} />
            <span className="flex-1 font-medium">{item.label}</span>
            
            {item.premium && (
              <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary border-primary/30">
                Pro
              </Badge>
            )}
            
            {item.count !== undefined && item.count > 0 && (
              <Badge 
                variant={item.isActive ? "secondary" : "outline"} 
                className={cn(
                  "ml-2 text-xs",
                  item.isActive ? "bg-white/20 text-white border-white/30" : "bg-primary/10 text-primary border-primary/30"
                )}
              >
                {item.count}
              </Badge>
            )}
          </Button>
        );
      })}

      <div className="pt-6 mt-6 border-t border-white/20 space-y-2">
        <Button
          variant="ghost"
          className="justify-start h-10 px-4 w-full text-muted-foreground hover:text-foreground hover:bg-white/20 glass-hover rounded-xl"
          onClick={() => onSectionChange?.('knowledge')}
        >
          <Database className="w-4 h-4 mr-3" />
          Base de connaissances
        </Button>
        
        <Button
          variant="ghost"
          className="justify-start h-10 px-4 w-full text-muted-foreground hover:text-foreground hover:bg-white/20 glass-hover rounded-xl"
          onClick={() => onSectionChange?.('settings')}
        >
          <Settings className="w-4 h-4 mr-3" />
          Paramètres
        </Button>
      </div>
    </nav>
  );
};

export default MainNavigation;