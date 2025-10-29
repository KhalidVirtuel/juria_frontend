import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  Zap,
  Search,
  Target,
  Gavel,
  Lightbulb,
  BookOpen,
  TrendingUp,
  Mic,
  MessageSquare
} from 'lucide-react';

const AISection: React.FC = () => {
  const aiFeatures = [
    {
      icon: Search,
      title: 'Assistant Recherche Juridique',
      description: 'Interrogez une base de données légale complète et obtenez des résumés de jurisprudence pertinente.',
      status: 'Actif',
      color: 'blue',
      premium: true
    },
    {
      icon: Target,
      title: 'Analyse Prédictive',
      description: 'Évaluez la probabilité de succès de vos affaires en vous basant sur des cas similaires.',
      status: 'Beta',
      color: 'purple',
      premium: true
    },
    {
      icon: Gavel,
      title: 'Préparation d\'Audience',
      description: 'Suggestions d\'arguments et contre-arguments possibles pour vos plaidoiries.',
      status: 'Bientôt',
      color: 'orange',
      premium: true
    },
    {
      icon: Lightbulb,
      title: 'Organisation Intelligente',
      description: 'Recommandations de priorisation de dossiers basées sur l\'urgence et l\'importance.',
      status: 'Dev',
      color: 'green',
      premium: true
    },
    {
      icon: MessageSquare,
      title: 'Copilote Chat',
      description: 'Assistant IA disponible 24/7 pour créer des notes, documents et répondre aux questions.',
      status: 'Actif',
      color: 'blue',
      premium: false
    },
    {
      icon: Mic,
      title: 'Copilote Vocal',
      description: 'Interaction vocale avec votre assistant pour gérer les tâches répétitives en mains libres.',
      status: 'Bientôt',
      color: 'purple',
      premium: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actif': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'Beta': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'Bientôt': return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'Dev': return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-500/20 to-blue-600/20 text-blue-600';
      case 'purple': return 'from-purple-500/20 to-purple-600/20 text-purple-600';
      case 'orange': return 'from-orange-500/20 to-orange-600/20 text-orange-600';
      case 'green': return 'from-green-500/20 to-green-600/20 text-green-600';
      default: return 'from-gray-500/20 to-gray-600/20 text-gray-600';
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            Super-pouvoirs IA
          </h1>
          <p className="text-muted-foreground">Fonctionnalités d'intelligence artificielle avancées pour votre cabinet</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
            <Zap className="w-3 h-3 mr-1" />
            IA Générative
          </Badge>
          <Button className="premium-button text-white">
            <Brain className="w-4 h-4 mr-2" />
            Activer Pro
          </Button>
        </div>
      </div>

      {/* AI Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="glass-card-premium border-white/30 hover:shadow-glow transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getIconColor(feature.color)} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary" className={getStatusColor(feature.status)}>
                      {feature.status}
                    </Badge>
                    {feature.premium && (
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30 text-xs">
                        Pro
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  {feature.description}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full glass-hover border-white/20"
                  disabled={feature.status === 'Bientôt' || feature.status === 'Dev'}
                >
                  {feature.status === 'Actif' && 'Utiliser'}
                  {feature.status === 'Beta' && 'Tester'}
                  {feature.status === 'Bientôt' && 'Bientôt disponible'}
                  {feature.status === 'Dev' && 'En développement'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Capabilities Overview */}
      <Card className="glass-card-premium border-white/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Capacités IA Avancées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Recherche & Analyse
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Analyse sémantique de documents juridiques
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Recherche dans 500K+ décisions de justice
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Veille juridique automatisée
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Résumés intelligents multi-documents
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Prédiction & Recommandations
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  Prédiction de l'issue des procédures
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  Estimation des délais judiciaires
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  Recommandations stratégiques
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  Optimisation de la charge de travail
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card className="glass-card-premium border-white/30 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            L'IA au Service de Votre Excellence Juridique
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Débloquez le potentiel complet de l'intelligence artificielle pour transformer 
            votre pratique juridique. Recherche avancée, analyse prédictive, et assistance 
            intelligente pour une efficacité sans précédent.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button className="premium-button text-white">
              <Zap className="w-4 h-4 mr-2" />
              Activer Premium IA
            </Button>
            <Button variant="outline" className="glass-hover border-white/20">
              <BookOpen className="w-4 h-4 mr-2" />
              Guide d'utilisation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AISection;