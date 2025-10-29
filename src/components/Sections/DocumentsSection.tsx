import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText,
  Plus,
  Search,
  Filter,
  Sparkles,
  BookOpen,
  Download,
  Edit,
  Copy
} from 'lucide-react';

const DocumentsSection: React.FC = () => {
  const documentTypes = [
    { type: 'contract', label: 'Contrats', icon: '📋', count: 23, color: 'blue' },
    { type: 'conclusion', label: 'Conclusions', icon: '⚖️', count: 15, color: 'purple' },
    { type: 'letter', label: 'Courriers', icon: '✉️', count: 32, color: 'green' },
    { type: 'note', label: 'Notes internes', icon: '📝', count: 18, color: 'orange' },
    { type: 'report', label: 'Rapports', icon: '📊', count: 7, color: 'red' },
    { type: 'template', label: 'Modèles', icon: '🔖', count: 45, color: 'indigo' }
  ];

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Documents & Modèles</h1>
          <p className="text-muted-foreground">Bibliothèque de documents juridiques avec IA générative</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="glass-hover border-white/20">
            <BookOpen className="w-4 h-4 mr-2" />
            Bibliothèque
          </Button>
          <Button variant="outline" className="glass-hover border-white/20">
            <Sparkles className="w-4 h-4 mr-2" />
            Générer avec IA
          </Button>
          <Button className="premium-button text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau document
          </Button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Rechercher un document ou modèle..."
            className="w-full pl-10 pr-4 py-2 glass-effect border border-white/20 rounded-xl bg-white/10 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <Button variant="outline" className="glass-hover border-white/20">
          <Filter className="w-4 h-4 mr-2" />
          Filtres
        </Button>
      </div>

      {/* Document types grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {documentTypes.map((type) => (
          <Card key={type.type} className="glass-card-premium border-white/30 hover:shadow-glow transition-all duration-300 cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-3">{type.icon}</div>
              <h3 className="font-medium text-foreground text-sm mb-2">{type.label}</h3>
              <Badge 
                variant="secondary" 
                className={`
                  ${type.color === 'blue' ? 'bg-blue-500/10 text-blue-600' : ''}
                  ${type.color === 'purple' ? 'bg-purple-500/10 text-purple-600' : ''}
                  ${type.color === 'green' ? 'bg-green-500/10 text-green-600' : ''}
                  ${type.color === 'orange' ? 'bg-orange-500/10 text-orange-600' : ''}
                  ${type.color === 'red' ? 'bg-red-500/10 text-red-600' : ''}
                  ${type.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-600' : ''}
                `}
              >
                {type.count}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Features */}
      <Card className="glass-card-premium border-white/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Super-pouvoirs IA pour Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-hover rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Edit className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-foreground mb-2">Rédaction assistée</h4>
              <p className="text-sm text-muted-foreground">
                L'IA vous aide à rédiger contrats, conclusions et mémoires
              </p>
            </div>
            
            <div className="glass-hover rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-foreground mb-2">Résumés automatiques</h4>
              <p className="text-sm text-muted-foreground">
                Résumés intelligents de documents longs et complexes
              </p>
            </div>
            
            <div className="glass-hover rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Copy className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-foreground mb-2">Modèles intelligents</h4>
              <p className="text-sm text-muted-foreground">
                Modèles auto-adaptatifs selon le contexte juridique
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent documents placeholder */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Bibliothèque de Documents
          </h3>
          <p className="text-muted-foreground mb-6">
            Accédez à vos modèles juridiques, créez de nouveaux documents 
            avec l'assistance IA et gérez votre bibliothèque.
          </p>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
            Interface complète en développement
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default DocumentsSection;