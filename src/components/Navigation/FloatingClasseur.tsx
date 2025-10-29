import React, { useState } from 'react';
import { 
  FolderOpen, 
  Calendar,
  CreditCard,
  Mail,
  FileText,
  Users,
  BarChart3,
  Brain,
  Settings,
  Archive,
  Briefcase
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Section {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  premium?: boolean;
}

interface FloatingClasseurProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  variant?: 'floating' | 'topbar';
}

const FloatingClasseur: React.FC<FloatingClasseurProps> = ({ 
  activeSection, 
  onSectionChange,
  variant = 'floating'
}) => {
  const sections: Section[] = [
    {
      id: 'cases',
      title: 'Dossiers & Clients',
      description: 'Gérez vos dossiers et clients',
      icon: FolderOpen,
    },
    {
      id: 'calendar',
      title: 'Agenda & Planning',
      description: 'Planifiez vos audiences',
      icon: Calendar,
    },
    {
      id: 'billing',
      title: 'Facturation',
      description: 'Temps & facturation',
      icon: CreditCard,
      premium: true,
    },
    {
      id: 'communication',
      title: 'Communication',
      description: 'Messages clients',
      icon: Mail,
    },
    {
      id: 'documents',
      title: 'Documents & Modèles',
      description: 'Modèles & contrats',
      icon: FileText,
    },
    {
      id: 'clients',
      title: 'Clients',
      description: 'Base clients',
      icon: Users,
    },
    {
      id: 'analytics',
      title: 'Analyses & Rapports',
      description: 'Rapports & insights',
      icon: BarChart3,
      premium: true,
    },
    {
      id: 'ai',
      title: 'Super-pouvoirs IA',
      description: 'IA avancée',
      icon: Brain,
      premium: true,
    },
    {
      id: 'settings',
      title: 'Paramètres',
      description: 'Configuration',
      icon: Settings,
    },
  ];

  // Organiser les sections par catégories pour les onglets
  const tabCategories = {
    'dossiers': {
      label: 'Dossiers',
      sections: sections.filter(s => ['cases', 'clients'].includes(s.id))
    },
    'planning': {
      label: 'Planning',
      sections: sections.filter(s => ['calendar', 'communication'].includes(s.id))
    },
    'documents': {
      label: 'Documents',
      sections: sections.filter(s => ['documents', 'analytics'].includes(s.id))
    },
    'outils': {
      label: 'Outils',
      sections: sections.filter(s => ['ai', 'billing', 'settings'].includes(s.id))
    }
  };

  const buttonClasses = variant === 'topbar' 
    ? "p-3 rounded-full border border-border bg-background/80 shadow-apple-chrome hover:bg-muted transition"
    : "fixed top-4 right-20 w-12 h-12 rounded-full border border-border bg-background/80 shadow-apple-chrome flex items-center justify-center z-50 hover:bg-muted transition";

  const iconComponent = variant === 'topbar' ? Briefcase : FolderOpen;

  const renderSectionButton = (section: Section) => {
    const Icon = section.icon;
    const isActive = activeSection === section.id;
    
    return (
      <button
        key={section.id}
        onClick={() => onSectionChange(section.id)}
        className={`flex items-center gap-3 p-3 rounded-lg transition-all text-left group border w-full ${
          isActive 
            ? 'bg-muted/40 border-border' 
            : 'hover:bg-muted border-transparent'
        }`}
      >
        <div className={`p-2 rounded-lg border ${
          isActive 
            ? 'bg-card border-border text-foreground' 
            : 'bg-card border-transparent text-foreground/70 group-hover:text-foreground'
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <div className="font-semibold text-sm text-foreground">{section.title}</div>
          <div className="text-xs text-muted-foreground">{section.description}</div>
        </div>
      </button>
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={buttonClasses}>
          <div className="relative">
            {variant === 'topbar' ? (
              <div className="p-1.5 rounded-full border border-border bg-card">
                {React.createElement(iconComponent, { 
                  className: "h-4 w-4 text-foreground" 
                })}
              </div>
            ) : (
              <>
                {React.createElement(iconComponent, { 
                  className: "w-5 h-5 text-foreground transition-transform duration-300 hover:scale-105" 
                })}
              </>
            )}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-0" 
        align={variant === 'topbar' ? 'end' : 'start'}
        side={variant === 'topbar' ? 'bottom' : 'right'}
      >
        <Tabs defaultValue="dossiers" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {Object.entries(tabCategories).map(([key, category]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(tabCategories).map(([key, category]) => (
            <TabsContent key={key} value={key} className="p-4 space-y-2">
              {category.sections.map(renderSectionButton)}
            </TabsContent>
          ))}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default FloatingClasseur;