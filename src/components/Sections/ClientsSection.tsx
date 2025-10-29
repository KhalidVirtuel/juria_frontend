import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  Plus,
  Search,
  Filter,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  TrendingUp
} from 'lucide-react';

const ClientsSection: React.FC = () => {
  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Base de Données Clients</h1>
          <p className="text-muted-foreground">Gérez vos clients avec une vue 360° complète</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="glass-hover border-white/20">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button className="premium-button text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau client
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card-premium border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total clients</p>
                <p className="text-2xl font-bold text-foreground">247</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card-premium border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Particuliers</p>
                <p className="text-2xl font-bold text-blue-600">189</p>
              </div>
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card-premium border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entreprises</p>
                <p className="text-2xl font-bold text-green-600">58</p>
              </div>
              <Building className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card-premium border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nouveaux ce mois</p>
                <p className="text-2xl font-bold text-purple-600">12</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Rechercher un client..."
            className="w-full pl-10 pr-4 py-2 glass-effect border border-white/20 rounded-xl bg-white/10 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <Button variant="outline" className="glass-hover border-white/20">
          <Filter className="w-4 h-4 mr-2" />
          Filtres
        </Button>
      </div>

      {/* Client features */}
      <Card className="glass-card-premium border-white/30">
        <CardHeader>
          <CardTitle>Vue 360° Client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-hover rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-foreground mb-2">Profil complet</h4>
              <p className="text-sm text-muted-foreground">
                Informations personnelles et professionnelles centralisées
              </p>
            </div>
            
            <div className="glass-hover rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-foreground mb-2">Historique échanges</h4>
              <p className="text-sm text-muted-foreground">
                Appels, emails, réunions - tout est tracé
              </p>
            </div>
            
            <div className="glass-hover rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-foreground mb-2">Dossiers liés</h4>
              <p className="text-sm text-muted-foreground">
                Accès direct à tous les dossiers du client
              </p>
            </div>
            
            <div className="glass-hover rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-medium text-foreground mb-2">Analytics</h4>
              <p className="text-sm text-muted-foreground">
                Statistiques et insights sur la relation client
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            CRM Juridique Avancé
          </h3>
          <p className="text-muted-foreground mb-6">
            Système de gestion client complet avec vue 360°, 
            historique des interactions et analytics avancés.
          </p>
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>Synchronisation emails</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>Historique appels</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>Géolocalisation</span>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
            Module CRM - En développement
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default ClientsSection;