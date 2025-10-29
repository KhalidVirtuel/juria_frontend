import React, { useState } from 'react';
import { Search, FileText, Scale, Users, Calendar } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Card, CardContent } from '@/components/ui/card';

const CenterSection: React.FC = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto">
      {/* Logo */}
      <div className="mb-12 text-center">
        <div className="mb-6 apple-glow-subtle">
          <Logo size="lg" className="h-16 mx-auto mb-4" />
        </div>
        <h1 className="text-5xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600 bg-clip-text mb-3">
          Jure AI
        </h1>
        <p className="text-xl text-white/70 font-light">
          Votre assistant juridique intelligent
        </p>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-lg">
        <div 
          className={`
            relative transition-all duration-300 ease-out
            ${searchFocused ? 'apple-glow scale-[1.02]' : ''}
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur-sm" />
          <div className="relative apple-glass-input rounded-2xl backdrop-blur-xl border border-white/20">
            <div className="flex items-center px-6 py-4">
              <Search className={`h-5 w-5 transition-colors duration-200 ${
                searchFocused ? 'text-blue-400' : 'text-white/50'
              }`} />
              <input
                type="text"
                placeholder="Posez votre question juridique..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="flex-1 ml-4 bg-transparent text-white/90 placeholder-white/50 outline-none text-lg font-light"
              />
            </div>
          </div>
        </div>

        {/* Search Suggestions */}
        {searchFocused && (
          <div className="mt-4 space-y-2 animate-fade-in">
            {[
              "Comment rédiger un contrat de travail ?",
              "Quelles sont les obligations d'un locataire ?",
              "Procédure de divorce à l'amiable",
            ].map((suggestion, index) => (
              <button
                key={index}
                className="w-full text-left px-4 py-3 rounded-xl apple-card-hover text-white/70 hover:text-white/90 text-sm transition-all duration-200"
                onClick={() => setSearchValue(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Feature Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-2xl">
        <Card className="apple-card-hover hover:apple-glow transition-all duration-300 hover:scale-[1.02] border-white/20 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="mb-3 flex justify-center">
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Rédaction Automatique</h3>
            <p className="text-sm text-white/70">Générez des documents juridiques en quelques clics</p>
          </CardContent>
        </Card>

        <Card className="apple-card-hover hover:apple-glow transition-all duration-300 hover:scale-[1.02] border-white/20 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="mb-3 flex justify-center">
              <Scale className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Analyse Juridique</h3>
            <p className="text-sm text-white/70">Analysez vos dossiers avec l'IA juridique</p>
          </CardContent>
        </Card>

        <Card className="apple-card-hover hover:apple-glow transition-all duration-300 hover:scale-[1.02] border-white/20 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="mb-3 flex justify-center">
              <Users className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Gestion Clients</h3>
            <p className="text-sm text-white/70">Organisez et suivez vos clients efficacement</p>
          </CardContent>
        </Card>

        <Card className="apple-card-hover hover:apple-glow transition-all duration-300 hover:scale-[1.02] border-white/20 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="mb-3 flex justify-center">
              <Calendar className="h-8 w-8 text-orange-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Planning Intelligent</h3>
            <p className="text-sm text-white/70">Planifiez vos audiences et rendez-vous</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-12 grid grid-cols-3 gap-4 w-full max-w-md">
        {[
          { icon: "📋", label: "Nouveau Dossier" },
          { icon: "📄", label: "Modèles" },
          { icon: "⚖️", label: "Jurisprudence" },
        ].map((action, index) => (
          <button
            key={index}
            className="p-4 apple-card-hover rounded-xl transition-all duration-200 hover:apple-glow hover:scale-105 group"
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <div className="text-sm text-white/70 group-hover:text-white/90">
              {action.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CenterSection;