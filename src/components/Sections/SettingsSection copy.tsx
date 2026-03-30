import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Key,
  Globe,
  Zap,
  HelpCircle
} from 'lucide-react';

const SettingsSection: React.FC = () => {
  const settingsSections = [
    {
      icon: User,
      title: 'Profil & Cabinet',
      description: 'Informations personnelles et configuration du cabinet',
      items: ['Données personnelles', 'Informations cabinet', 'Équipe', 'Spécialisations']
    },
    {
      icon: Shield,
      title: 'Sécurité & Confidentialité',
      description: 'Paramètres de sécurité et protection des données',
      items: ['Authentification 2FA', 'Chiffrement E2E', 'Audit des accès', 'RGPD']
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Gestion des alertes et rappels',
      items: ['Échéances', 'Nouveaux messages', 'Rappels audience', 'Veille juridique']
    },
    {
      icon: Palette,
      title: 'Interface & Thème',
      description: 'Personnalisation de l\'interface utilisateur',
      items: ['Mode sombre/clair', 'Couleurs', 'Police', 'Mise en page']
    },
    {
      icon: Database,
      title: 'Données & Synchronisation',
      description: 'Gestion des données et synchronisation',
      items: ['Sauvegarde', 'Import/Export', 'Synchronisation cloud', 'Archivage']
    },
    {
      icon: Zap,
      title: 'IA & Automatisation',
      description: 'Configuration des fonctionnalités IA',
      items: ['Modèles IA', 'Automatisations', 'Workflows', 'Préférences']
    }
  ];

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Paramètres
          </h1>
          <p className="text-muted-foreground">Configuration et personnalisation de votre cabinet numérique</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="glass-hover border-white/20">
            <HelpCircle className="w-4 h-4 mr-2" />
            Aide
          </Button>
          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/30">
            Tout sauvegardé
          </Badge>
        </div>
      </div>

      {/* Quick Settings */}
      <Card className="glass-card-premium border-white/30">
        <CardHeader>
          <CardTitle>Paramètres Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Mode sombre</h4>
                  <p className="text-sm text-muted-foreground">Interface en mode sombre</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Notifications push</h4>
                  <p className="text-sm text-muted-foreground">Alertes en temps réel</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Assistant IA toujours actif</h4>
                  <p className="text-sm text-muted-foreground">Copilote en arrière-plan</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Sauvegarde automatique</h4>
                  <p className="text-sm text-muted-foreground">Toutes les 15 minutes</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Chiffrement E2E</h4>
                  <p className="text-sm text-muted-foreground">Sécurité maximale</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Analyse des performances</h4>
                  <p className="text-sm text-muted-foreground">Statistiques d'usage</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index} className="glass-card-premium border-white/30 hover:shadow-glow transition-all duration-300 cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary/50 rounded-full"></div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4 glass-hover border-white/20">
                  Configurer
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Account & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card-premium border-white/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Sécurité du Compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Authentification 2FA</h4>
                <p className="text-sm text-muted-foreground">Double authentification activée</p>
              </div>
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/30">
                Actif
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Dernière connexion</h4>
                <p className="text-sm text-muted-foreground">Aujourd'hui à 09:24</p>
              </div>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                Paris, FR
              </Badge>
            </div>
            
            <Button variant="outline" className="w-full glass-hover border-white/20">
              Changer le mot de passe
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card-premium border-white/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Préférences Régionales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Langue</h4>
                <p className="text-sm text-muted-foreground">Interface utilisateur</p>
              </div>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                Français
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Juridiction</h4>
                <p className="text-sm text-muted-foreground">Droit applicable</p>
              </div>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                France
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Fuseau horaire</h4>
                <p className="text-sm text-muted-foreground">GMT+1 (Paris)</p>
              </div>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                CET
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsSection;