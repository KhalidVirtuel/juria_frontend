import React, { useEffect, useState } from 'react';
import { LiquidGlassButton } from '@/components/ui/liquid-glass-button';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Sparkles, MessageSquare, Shield, BarChart3, Target, TrendingUp, FolderOpen } from 'lucide-react';
import gavelJusticeIcon from '@/assets/gavel-justice-icon.png';
import usersBlueIcon from '@/assets/users-blue-icon.png';
import brainBlueIcon from '@/assets/brain-blue-icon.png';
import { Link, useNavigate } from 'react-router-dom';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import lawyer1 from '@/assets/lawyer-1.jpg';
import lawyer2 from '@/assets/lawyer-2.jpg';
import lawyer3 from '@/assets/lawyer-3.jpg';
import lawyer4 from '@/assets/lawyer-4.jpg';
import officeLawyer from '@/assets/office-lawyer.png';
import logoImage from '@/assets/logo.png';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { BentoCard } from '@/components/ui/bento';
import lawyerStressedCall from '@/assets/lawyer-stressed-call.png';
import lawyerOverwhelmedEmails from '@/assets/lawyer-overwhelmed-emails.png';
import lawyerLeavingDefeated from '@/assets/lawyer-leaving-defeated.png';
const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('assistant');
  const [chatInput, setChatInput] = useState('');
  const [showAIResponse, setShowAIResponse] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  // Hook pour l'animation au scroll
  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-scroll-reveal');
        }
      });
    };
    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '50px'
    });
    const scrollElements = document.querySelectorAll('.scroll-reveal');
    scrollElements.forEach(el => observer.observe(el));
    return () => {
      scrollElements.forEach(el => observer.unobserve(el));
    };
  }, []);
  React.useEffect(() => {
    document.title = 'Mizen AI - Assistant juridique IA';
    const desc = "Assistant IA pour la rédaction et l'analyse juridique.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
  }, []);
  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    setShowAIResponse(true);
    setAiResponse('');

    // Simuler une réponse de l\'IA avec un délai
    setTimeout(() => {
      const responses = ["Selon l'article 1134 du Code civil, les contrats légalement formés tiennent lieu de loi à ceux qui les ont faits. Pour votre situation...", "En droit du travail, votre cas relève de l'article L1234-1 du Code du travail. Je recommande de vérifier les conditions de rupture...", "Cette question touche au droit des sociétés. D'après l'article L225-27 du Code de commerce...", "Votre problématique juridique nécessite une analyse approfondie. Voici les premiers éléments de réponse..."];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setAiResponse(randomResponse);
    }, 800);
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleChatSubmit();
    }
  };
  return <div className="min-h-screen bg-background font-onest">
      {/* Floating Header */}
      <header className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-5xl px-6">
        <div className="backdrop-blur-md rounded-2xl border border-white/10 px-12 py-4">
          <div className="flex items-center justify-between w-full">
            {/* Logo - Left */}
            <div className="flex items-center">
              <img src={logoImage} alt="Jure Logo" className="h-12 w-12" />
            </div>
            
            {/* Navigation - Center */}
            <nav className="hidden md:flex items-center gap-12">
              <a href="#features" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                Fonctionnalités
              </a>
              <a href="#users" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                Pour qui
              </a>
              <a href="#faq" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                FAQ
              </a>
              <a href="#contact" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                Contact
              </a>
            </nav>
            
            {/* CTA Button - Right */}
            <div className="flex items-center">
            <Link to="/app">
              <LiquidGlassButton variant="default" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                Commencer
              </LiquidGlassButton>
            </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Centered Layout */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-28 pb-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(210, 100%, 15%) 0%, hsl(215, 95%, 20%) 100%)' }}>
        {/* Background gradient with grid pattern */}
        <div className="absolute inset-0 z-0" style={{ 
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
        
        <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col items-center">
          {/* Centered Content */}
          <div className="text-center w-full">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm border border-white/20">
                Intégration Complète
              </span>
            </div>
            <h1 className="text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] font-bold tracking-[-0.05em] leading-none mb-6">
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Mizen <span style={{ color: '#0183D5', textShadow: '0 0 20px rgba(1, 131, 213, 0.5)', WebkitTextFillColor: '#0183D5' }}>AI</span>
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/95 mb-6 mx-auto max-w-2xl font-medium leading-tight">
              Après l'avoir utilisé, votre métier ne sera plus pareil
            </p>
            
            <p className="text-lg md:text-xl text-white/90 mb-8 mx-auto max-w-lg font-light">
              Révolutionnez votre pratique juridique avec l'intelligence artificielle
            </p>

            {/* Chat Input Bar */}
            <div className="relative mb-8 mx-auto max-w-2xl">
              <div className="relative">
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Posez votre question juridique..." className="w-full px-6 py-4 pr-16 text-white placeholder-white/70 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-300" />
                <button onClick={handleChatSubmit} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 group">
                  <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-0.5 transition-transform duration-200" />
                </button>
              </div>
              <p className="text-white/70 text-sm mt-2">
                Commencez directement avec votre assistant juridique IA
              </p>

              {/* AI Response Popup */}
              {showAIResponse && <div className="w-full mt-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white/90 text-sm leading-relaxed">
                        {aiResponse || <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{
                        animationDelay: '0.2s'
                      }}></div>
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{
                        animationDelay: '0.4s'
                      }}></div>
                            <span className="text-white/70 ml-2">Mizen AI réfléchit...</span>
                          </div>}
                      </div>
                      {aiResponse && <button onClick={() => navigate('/app')} className="text-blue-300 hover:text-blue-200 text-sm font-medium mt-3 transition-colors duration-200">
                          Voir plus →
                        </button>}
                    </div>
                  </div>
                </div>}
            </div>

            {/* Testimonial avec avatars */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="flex -space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-3 border-white/30 shadow-lg">
                  <img src={lawyer1} alt="Avocat 1" className="w-full h-full object-cover" />
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden border-3 border-white/30 shadow-lg">
                  <img src={lawyer2} alt="Avocat 2" className="w-full h-full object-cover" />
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden border-3 border-white/30 shadow-lg">
                  <img src={lawyer3} alt="Avocat 3" className="w-full h-full object-cover" />
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden border-3 border-white/30 shadow-lg">
                  <img src={lawyer4} alt="Avocat 4" className="w-full h-full object-cover" />
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium">
                Utilisé par +500 professionnels
              </p>
            </div>

            {/* Before/After Slider - Centered Below */}
            <div className="hidden lg:block w-full max-w-4xl mx-auto">
              <BeforeAfterSlider />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - 3 Cards */}
      <section className="py-32 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-black dark:text-white">Le coût de l'</span>
              <span className="text-[#1e3a8a]">inaction</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-white/80 max-w-2xl mx-auto">
              Chaque jour sans assistant IA, c'est une opportunité perdue
            </p>
          </div>

          {/* 3 Bento Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <BentoCard eyebrow="Appels manqués" title="Clients qui attendent" description="Pendant que vous êtes en rendez-vous, vos appels s'accumulent. Les clients n'attendent pas." graphic={<div className="absolute inset-0">
                  <img src={lawyerStressedCall} alt="Avocat stressé recevant un appel" className="w-full h-full object-cover" />
                </div>} />
            <BentoCard eyebrow="Surcharge de travail" title="Emails sans réponse" description="Des dizaines d'emails urgents restent sans réponse. Vos clients partent à la concurrence." graphic={<div className="absolute inset-0">
                  <img src={lawyerOverwhelmedEmails} alt="Avocat débordé par les emails" className="w-full h-full object-cover" />
                </div>} />
            <BentoCard eyebrow="Épuisement" title="Clients qui partent" description="Sans accompagnement immédiat, vos clients cherchent ailleurs. La frustration monte." graphic={<div className="absolute inset-0">
                  <img src={lawyerLeavingDefeated} alt="Avocat quittant le bureau épuisé" className="w-full h-full object-cover" />
                </div>} />
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-32 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Imaginez ne plus jamais manquer un dossier urgent
              </h2>
              
              <p className="text-lg text-white/70 max-w-xl">
                JurisSmart s'intègre parfaitement à tous vos outils de travail : 
                messagerie, calendrier, système de gestion des dossiers et bases de données juridiques. 
                Une seule plateforme pour gérer toutes vos interactions professionnelles.
              </p>

              {/* Integration Icons */}
              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm flex items-center gap-2">
                  <span className="text-orange-500">📧</span> Email
                </div>
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm flex items-center gap-2">
                  <span className="text-orange-500">📅</span> Calendrier
                </div>
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm flex items-center gap-2">
                  <span className="text-orange-500">📞</span> Téléphone
                </div>
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm flex items-center gap-2">
                  <span className="text-orange-500">💼</span> Outils juridiques
                </div>
              </div>

              <div className="pt-4">
                <Button size="lg" className="bg-black hover:bg-black/80 text-white dark:bg-white dark:text-black dark:hover:bg-white/80">
                  Découvrir les intégrations →
                </Button>
              </div>
            </div>

            {/* Right Image - Placeholder for user's image */}
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-white/10">
                <p className="text-white/50 text-center px-8">
                  Image à venir
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Knowledge Base Section */}
      <section className="py-32 px-6 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center">
            {/* Knowledge Base Preview Section */}
            <div className="">
              <div className="text-center mb-12">
                <h3 className="text-2xl font-bold mb-3">
                  Ma force vient de ce que je sais.
                </h3>
                <p className="text-muted-foreground">
                  Voici un aperçu des documents clés utilisés pour construire ma base de connaissance.
                </p>
              </div>

              {/* Knowledge Sources Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                <div className="bg-card rounded-xl p-6 border border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg flex flex-col items-center justify-center text-center min-h-[200px]">
                  <img src="/lovable-uploads/0c3b834d-d0e9-485e-9431-860cd32a0032.png" alt="Code Civil" className="w-16 h-16 mb-4" />
                  <h4 className="font-semibold mb-2">Code Civil Marocain</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Dahir des obligations et contrats, droit de la famille, etc...
                  </p>
                  <div className="text-xs text-accent font-medium">
                    15,234 articles
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg flex flex-col items-center justify-center text-center min-h-[200px]">
                  <img src="/lovable-uploads/3ca234a8-0c28-4eb5-994a-12f38c49a948.png" alt="Jurisprudence" className="w-16 h-16 mb-4" />
                  <h4 className="font-semibold mb-2">Jurisprudence</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Arrêts de la Cour de cassation, décisions importantes, etc...
                  </p>
                  <div className="text-xs text-accent font-medium">
                    42,567 décisions
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg flex flex-col items-center justify-center text-center min-h-[200px]">
                  <img src="/lovable-uploads/e482067a-f784-4785-8e93-097e1cab80fc.png" alt="Droit Commercial" className="w-16 h-16 mb-4" />
                  <h4 className="font-semibold mb-2">Droit Commercial</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Code de commerce, sociétés, faillite, etc...
                  </p>
                  <div className="text-xs text-accent font-medium">
                    8,932 textes
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg flex flex-col items-center justify-center text-center min-h-[200px]">
                  <img src="/lovable-uploads/f2ca5b9c-cfe5-4038-91bc-909197263358.png" alt="Modèles Types" className="w-16 h-16 mb-4" />
                  <h4 className="font-semibold mb-2">Modèles Types</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Contrats, actes, procédures standardisées, etc...
                  </p>
                  <div className="text-xs text-accent font-medium">
                    2,145 modèles
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section - Interactive Tabs */}
      <section className="py-32 px-6 bg-gradient-to-b from-background to-muted/20 flex items-center justify-center min-h-screen">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center w-full">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-[-0.03em] mb-6">
              Et maintenant, ce que je peux faire pour vous
            </h2>
            <p className="text-xl text-muted-foreground font-light max-w-3xl mx-auto">
              Je ne suis pas là pour vous inonder d'outils.<br />
              Je suis là pour alléger vos journées, affûter vos arguments et apaiser vos nuits.
            </p>
          </div>

          {/* Modern Grid Cards Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[{
            id: 'assistant',
            title: 'Répondre',
            subtitle: 'Assistant IA 24/7',
            description: 'Posez-moi une question, j\'y réponds. À tout moment, 24/7. Des réponses claires, contextualisées, sans détour.',
            icon: MessageSquare
          }, {
            id: 'redaction',
            title: 'Rédiger',
            subtitle: 'Rédaction IA',
            description: 'Un contrat, une requête, un acte… Je génère vos brouillons en quelques minutes. Fini le copier-coller.',
            icon: Brain
          }, {
            id: 'analyse',
            title: 'Analyser',
            subtitle: 'Analyse Juridique',
            description: 'Vous m\'apportez un dossier, je le décortique. Je parcours la jurisprudence et mets en lumière ce que d\'autres n\'auraient pas vu.',
            icon: Brain
          }, {
            id: 'recherche',
            title: 'Organiser',
            subtitle: 'CRM Juridique',
            description: 'Clients, dossiers, audiences : tout est centralisé. Vous ne courez plus après l\'information, vous avancez.',
            icon: FolderOpen
          }].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return <div key={item.id} onClick={() => setActiveTab(item.id)} className={`group relative p-8 rounded-2xl border transition-all duration-300 cursor-pointer ${isActive ? 'bg-card border-accent shadow-lg scale-[1.02]' : 'bg-card/50 border-border hover:bg-card hover:border-accent/50 hover:shadow-md'}`}>
                  {/* Floating Elements */}
                  <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                    <Icon className="h-16 w-16" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 ${isActive ? 'bg-accent/10 shadow-sm' : 'bg-muted/50 group-hover:bg-accent/5'}`}>
                      <Icon className={`h-6 w-6 transition-colors duration-300 ${isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    </div>
                    
                    {/* Title */}
                    <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${isActive ? 'text-foreground' : 'text-foreground'}`}>
                      {item.title}
                    </h3>
                    
                    {/* Subtitle */}
                    <p className="text-sm font-medium mb-4 text-muted-foreground">
                      {item.subtitle}
                    </p>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                    
                    {/* Status Indicator */}
                    <div className="flex items-center mt-6">
                      <div className={`w-2 h-2 rounded-full mr-2 transition-all duration-300 ${isActive ? 'bg-accent' : 'bg-muted-foreground/30'}`}></div>
                      <span className={`text-xs font-medium transition-colors duration-300 ${isActive ? 'text-accent' : 'text-muted-foreground'}`}>
                        {isActive ? 'Actif' : 'Disponible'}
                      </span>
                    </div>
                  </div>
                </div>;
          })}
          </div>

          {/* Active Feature Showcase */}
          {activeTab && <div className="mt-16 max-w-3xl mx-auto">
              
            </div>}

          {/* Call to action */}
          
        </div>
      </section>

      {/* Decision Support Banner */}
      <section className="py-16 px-6 bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              En développement continu
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.03em] mb-6">
              Assistance à la <span className="text-accent">prise de décision</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
              Notre IA devient de plus en plus puissante chaque jour et sera bientôt la référence 
              la plus qualifiée pour vous guider dans vos décisions juridiques. Obtenez des scores 
              de probabilité précis pour évaluer vos options et optimiser vos stratégies.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Scores de probabilité</h3>
                <p className="text-sm text-muted-foreground">Évaluez vos chances de succès avec des pourcentages précis</p>
              </div>
              
              <div className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Recommandations ciblées</h3>
                <p className="text-sm text-muted-foreground">Recevez des conseils personnalisés selon votre situation</p>
              </div>
              
              <div className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Amélioration continue</h3>
                <p className="text-sm text-muted-foreground">Une IA qui apprend et s'améliore en permanence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Management Tool Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-muted/10 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-[-0.03em] mb-6">
              Un outil de gestion conçu pour les <span className="text-accent font-medium">cabinets</span>
            </h2>
            <p className="text-xl text-muted-foreground font-light max-w-4xl mx-auto leading-relaxed">
              L'objectif était d'allier la force de l'IA à un CRM de gestion et de créer une solution tout-en-un parfaite pour les cabinets
            </p>
          </div>

          {/* Image Section */}
          <div className="mb-16 flex justify-center">
            <div className="max-w-4xl w-full">
              <img src="/lovable-uploads/40eecad9-4c56-4ade-b436-0b4d1b36546f.png" alt="Interface de gestion Mizen AI" className="w-full h-auto rounded-xl shadow-lg" />
            </div>
          </div>

          {/* Content Section */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-semibold mb-6">
                Gérez tout depuis une seule plateforme
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Fini les outils dispersés et les processus fragmentés. Notre solution centralisée vous permet de gérer l'ensemble de votre cabinet avec l'intelligence artificielle intégrée.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
              <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all duration-300 text-center max-w-sm">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Brain className="h-6 w-6 text-accent" />
                </div>
                <h4 className="font-semibold mb-2">IA Intégrée</h4>
                <p className="text-sm text-muted-foreground">
                  Intelligence artificielle native dans tous vos processus de gestion
                </p>
              </div>

              <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all duration-300 text-center max-w-sm">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <MessageSquare className="h-6 w-6 text-accent" />
                </div>
                <h4 className="font-semibold mb-2">CRM Juridique</h4>
                <p className="text-sm text-muted-foreground">
                  Gestion complète des clients, dossiers et communications
                </p>
              </div>

              <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all duration-300 text-center max-w-sm">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <h4 className="font-semibold mb-2">Sécurisé</h4>
                <p className="text-sm text-muted-foreground">
                  Conformité totale aux normes de sécurité juridique
                </p>
              </div>

              <div className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all duration-300 text-center max-w-sm">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
                <h4 className="font-semibold mb-2">Tout-en-un</h4>
                <p className="text-sm text-muted-foreground">
                  Une seule solution pour tous vos besoins de cabinet
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Preview */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <img src="/lovable-uploads/0f124b46-87b3-4c92-ace1-2c1ee1b37775.png" alt="Mizen AI Decision Support Preview" className="mx-auto max-w-full h-auto rounded-2xl shadow-2xl" />
          </div>
          <p className="text-sm text-muted-foreground font-light">
            Prochainement
          </p>
        </div>
      </section>

      {/* FAQ Section - Enhanced Design */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-[-0.03em] mb-6">
              Questions Fréquentes
            </h2>
            <p className="text-xl text-muted-foreground font-light">
              Tout ce que vous devez savoir sur Mizen AI
            </p>
          </div>

          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border border-border rounded-2xl px-6 mb-4 bg-card">
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 text-accent" />
                    </div>
                    <span>Mes données sont-elles vraiment sécurisées ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 pl-14">
                  Absolument. Nous utilisons un chiffrement AES-256 de niveau bancaire pour protéger toutes vos données. Nos serveurs sont hébergés en Europe avec certification ISO 27001, et nous sommes entièrement conformes au RGPD. Vos informations client ne sont jamais partagées et restent strictement confidentielles.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-border rounded-2xl px-6 mb-4 bg-card">
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-blue-500" />
                    </div>
                    <span>Comment fonctionne l'essai gratuit ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 pl-14">
                  Votre essai gratuit de 14 jours vous donne accès à toutes les fonctionnalités de Mizen AI sans limitation. Aucune carte bancaire n'est requise pour commencer. Vous pouvez générer des documents, utiliser l'assistant IA, et explorer notre base de données juridique complète.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-border rounded-2xl px-6 mb-4 bg-card">
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Brain className="h-5 w-5 text-green-500" />
                    </div>
                    <span>L'IA peut-elle vraiment remplacer mon expertise juridique ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 pl-14">
                  Mizen AI est conçu pour augmenter votre expertise, pas la remplacer. Notre IA vous aide avec les tâches répétitives (rédaction de contrats standards, recherche juridique, analyse de documents) pour que vous puissiez vous concentrer sur le conseil stratégique et les aspects complexes qui nécessitent votre jugement professionnel.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-border rounded-2xl px-6 mb-4 bg-card">
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-5 w-5 text-purple-500" />
                    </div>
                    <span>Quelle est la précision des documents générés ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 pl-14">
                  Nos modèles d'IA sont entraînés sur plus de 50 000 textes de lois marocains et 150 000 décisions juridiques. La précision moyenne est de 98% pour les documents standards. Cependant, nous recommandons toujours une révision par un professionnel pour les cas complexes ou sensibles.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-border rounded-2xl px-6 mb-4 bg-card">
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ArrowRight className="h-5 w-5 text-orange-500" />
                    </div>
                    <span>Puis-je intégrer Mizen AI avec mes outils existants ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 pl-14">
                  Oui, Mizen AI propose des intégrations avec les principaux logiciels juridiques et de gestion de cabinet. Vous pouvez exporter vos documents vers Word, PDF, ou directement vers votre système de gestion documentaire. Notre API permet également des intégrations personnalisées.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border border-border rounded-2xl px-6 mb-4 bg-card">
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Brain className="h-5 w-5 text-teal-500" />
                    </div>
                    <span>Le support est-il disponible en français ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 pl-14">
                  Absolument. Notre équipe de support francophone est disponible du lundi au vendredi de 9h à 18h. Nous proposons également une base de connaissances complète, des tutoriels vidéo, et des webinaires de formation réguliers en français.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border border-border rounded-2xl px-6 mb-4 bg-card">
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 text-red-500" />
                    </div>
                    <span>Que se passe-t-il si je ne suis pas satisfait ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 pl-14">
                  Nous offrons une garantie de remboursement de 30 jours sans condition. Si Mizen AI ne répond pas à vos attentes, vous pouvez annuler votre abonnement et recevoir un remboursement complet. Nous croyons en la qualité de notre service et voulons que vous soyez entièrement satisfait.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Contact CTA */}
          <div className="text-center mt-12 p-8 bg-card border border-border rounded-2xl">
            <h3 className="text-xl font-semibold mb-3">Vous avez d'autres questions ?</h3>
            <p className="text-muted-foreground mb-6">
              Notre équipe d'experts est là pour vous accompagner
            </p>
            <Link to="/app">
              <LiquidGlassButton variant="default" size="default" className="bg-accent text-accent-foreground border-accent/20 hover:bg-accent/90">
                <MessageSquare className="h-4 w-4" />
                Contactez-nous
              </LiquidGlassButton>
            </Link>
          </div>
        </div>
      </section>


      

      {/* CTA Section */}
      

      {/* Footer */}
      <footer className="py-8 px-6 mt-8">
        <div className="max-w-6xl mx-auto">
          {/* Footer content with glass morphism background */}
          <div className="backdrop-blur-md rounded-3xl border border-white/10 px-12 py-12 shadow-2xl bg-blue-950">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {/* Logo & Description */}
              <div className="md:col-span-1">
                <div className="flex items-center gap-3 mb-6">
                  <img src="/lovable-uploads/6add8c62-19bc-4fe0-adbe-07a018557d34.png" alt="Jure Logo" className="h-10 w-10" />
                  <span className="text-xl font-bold text-white">Mizen AI</span>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  L'assistant juridique intelligent qui révolutionne votre pratique professionnelle.
                </p>
              </div>

              {/* Produit */}
              <div>
                <h4 className="text-white font-semibold mb-6">Produit</h4>
                <ul className="space-y-3">
                  <li><a href="#features" className="text-white/70 hover:text-white transition-colors text-sm">Fonctionnalités</a></li>
                  <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Tarifs</a></li>
                  <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Sécurité</a></li>
                  <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">API</a></li>
                </ul>
              </div>

              {/* Ressources */}
              <div>
                <h4 className="text-white font-semibold mb-6">Ressources</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Documentation</a></li>
                  <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Blog</a></li>
                  <li><a href="#faq" className="text-white/70 hover:text-white transition-colors text-sm">FAQ</a></li>
                  <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Support</a></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-white font-semibold mb-6">Contact</h4>
                <ul className="space-y-3">
                  <li><a href="#contact" className="text-white/70 hover:text-white transition-colors text-sm">Nous contacter</a></li>
                  <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Mentions légales</a></li>
                  <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Confidentialité</a></li>
                  <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">CGU</a></li>
                </ul>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 mt-12 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-white/60 text-sm">
                  © 2024 Mizen AI. Tous droits réservés.
                </p>
                <div className="flex items-center gap-6">
                  <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Politique de cookies</a>
                  <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">RGPD</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Landing;