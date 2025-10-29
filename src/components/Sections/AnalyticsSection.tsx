import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  DollarSign,
  Users,
  Clock,
  Target,
  Download,
  Calendar
} from 'lucide-react';

const AnalyticsSection: React.FC = () => {
  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Analyses & Rapports</h1>
          <p className="text-muted-foreground">Tableaux de bord et insights pour optimiser votre cabinet</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="glass-hover border-white/20">
            <Calendar className="w-4 h-4 mr-2" />
            Période
          </Button>
          <Button variant="outline" className="glass-hover border-white/20">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button className="premium-button text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Nouveau rapport
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card-premium border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus ce mois</p>
                <p className="text-2xl font-bold text-green-600">€15,240</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5%
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card-premium border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nouveaux clients</p>
                <p className="text-2xl font-bold text-blue-600">23</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8.3%
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card-premium border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Heures facturées</p>
                <p className="text-2xl font-bold text-purple-600">186h</p>
                <p className="text-xs text-purple-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15.2%
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card-premium border-white/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de réussite</p>
                <p className="text-2xl font-bold text-orange-600">87%</p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +3.1%
                </p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card-premium border-white/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Analyses Financières
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Graphique des revenus</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground">€152,340</p>
                  <p className="text-xs text-muted-foreground">Revenus annuels</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground">€12,695</p>
                  <p className="text-xs text-muted-foreground">Moyenne mensuelle</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-premium border-white/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Répartition par Domaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center h-40 bg-gradient-to-br from-purple/10 to-blue/10 rounded-xl">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Répartition des dossiers</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { domain: 'Droit des affaires', percentage: 45, color: 'blue' },
                  { domain: 'Droit du travail', percentage: 25, color: 'green' },
                  { domain: 'Droit de la famille', percentage: 20, color: 'orange' },
                  { domain: 'Autres', percentage: 10, color: 'gray' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.domain}</span>
                    <Badge variant="secondary" className={`
                      ${item.color === 'blue' ? 'bg-blue-500/10 text-blue-600' : ''}
                      ${item.color === 'green' ? 'bg-green-500/10 text-green-600' : ''}
                      ${item.color === 'orange' ? 'bg-orange-500/10 text-orange-600' : ''}
                      ${item.color === 'gray' ? 'bg-gray-500/10 text-gray-600' : ''}
                    `}>
                      {item.percentage}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analytics */}
      <Card className="glass-card-premium border-white/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Analytics IA Avancés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-hover rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-foreground mb-2">Analyse prédictive</h4>
              <p className="text-sm text-muted-foreground">
                Probabilité de succès basée sur l'historique
              </p>
            </div>
            
            <div className="glass-hover rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-foreground mb-2">Insights automatiques</h4>
              <p className="text-sm text-muted-foreground">
                Tendances et recommandations intelligentes
              </p>
            </div>
            
            <div className="glass-hover rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-foreground mb-2">Benchmarking</h4>
              <p className="text-sm text-muted-foreground">
                Comparaison avec les standards du marché
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content placeholder */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30 mb-4">
            Module Premium
          </Badge>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Tableaux de Bord Avancés
          </h3>
          <p className="text-muted-foreground">
            Analytics complets avec IA prédictive, insights automatiques 
            et rapports personnalisables pour optimiser votre cabinet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;