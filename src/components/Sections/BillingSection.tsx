import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard,
  Clock,
  Plus,
  TrendingUp,
  DollarSign,
  FileText,
  Download,
  Eye
} from 'lucide-react';

const BillingSection: React.FC = () => {
  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Facturation & Finances</h1>
          <p className="text-muted-foreground">Suivez votre temps facturable et générez vos factures</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="glass-hover border-white/20">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button className="premium-button text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle facture
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card-premium border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus ce mois</p>
                <p className="text-2xl font-bold text-green-600">€12,450</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card-premium border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Heures facturables</p>
                <p className="text-2xl font-bold text-blue-600">142h</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card-premium border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Factures en attente</p>
                <p className="text-2xl font-bold text-orange-600">8</p>
              </div>
              <FileText className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card-premium border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux horaire moyen</p>
                <p className="text-2xl font-bold text-purple-600">€280</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Module Facturation Pro
          </h3>
          <p className="text-muted-foreground mb-6">
            Fonctionnalité avancée en cours de développement. 
            Suivi automatique du temps, génération de factures et analyses financières.
          </p>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
            Bientôt disponible
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default BillingSection;