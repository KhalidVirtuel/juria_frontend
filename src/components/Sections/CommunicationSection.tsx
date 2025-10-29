import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail,
  MessageCircle,
  Phone,
  Video,
  Plus,
  Users,
  Shield,
  Archive
} from 'lucide-react';

const CommunicationSection: React.FC = () => {
  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Communication Sécurisée</h1>
          <p className="text-muted-foreground">Centralisez vos échanges avec vos clients en toute sécurité</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="glass-hover border-white/20">
            <Archive className="w-4 h-4 mr-2" />
            Archives
          </Button>
          <Button className="premium-button text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau message
          </Button>
        </div>
      </div>

      {/* Communication channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card-premium border-white/30 hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <Mail className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Email Sécurisé</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Messagerie chiffrée conforme RGPD
            </p>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
              Actif
            </Badge>
          </CardContent>
        </Card>
        
        <Card className="glass-card-premium border-white/30 hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Chat Client</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Messagerie instantanée sécurisée
            </p>
            <Badge variant="secondary" className="bg-green-500/10 text-green-600">
              En ligne
            </Badge>
          </CardContent>
        </Card>
        
        <Card className="glass-card-premium border-white/30 hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <Video className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Visioconférence</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Consultations à distance
            </p>
            <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">
              Disponible
            </Badge>
          </CardContent>
        </Card>
        
        <Card className="glass-card-premium border-white/30 hover:shadow-glow transition-all duration-300 cursor-pointer">
          <CardContent className="p-6 text-center">
            <Phone className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Téléphonie</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Appels enregistrés et transcrits
            </p>
            <Badge variant="secondary" className="bg-orange-500/10 text-orange-600">
              Intégré
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Communication Sécurisée Pro
          </h3>
          <p className="text-muted-foreground mb-6">
            Plateforme de communication unifiée avec chiffrement de bout en bout, 
            conformité RGPD et archivage automatique.
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">Chiffrement E2E</span>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
            Module avancé - Bientôt disponible
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default CommunicationSection;