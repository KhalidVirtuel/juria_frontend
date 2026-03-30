import React, { useEffect, useState } from 'react';
import { LiquidGlassButton } from '@/components/ui/liquid-glass-button';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Sparkles, MessageSquare, Shield, BarChart3, Target, TrendingUp, FolderOpen, ChevronDown, Zap } from 'lucide-react';
import gavelJusticeIcon from '@/assets/gavel-justice-icon.png';
import articleOfficeMorocco from '@/assets/article-office-morocco.jpg';
import articleLawyersMorocco from '@/assets/article-lawyers-morocco.jpg';
import articleMoroccoFlag from '@/assets/article-morocco-flag.jpg';
import usersBlueIcon from '@/assets/users-blue-icon.png';
import brainBlueIcon from '@/assets/brain-blue-icon.png';
import { Link, useNavigate } from 'react-router-dom';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

import { TestimonialsColumn } from '@/components/TestimonialsColumn';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSelector } from '@/components/LanguageSelector';
import lawyer1 from '@/assets/lawyer-1.jpg';
import lawyer2 from '@/assets/lawyer-2.jpg';
import lawyer3 from '@/assets/lawyer-3.jpg';
import lawyer4 from '@/assets/lawyer-4.jpg';
import officeLawyer from '@/assets/office-lawyer.png';
import logoMizen from '@/assets/logo-mizen.png';
import heroBgNew from '@/assets/hero-bg-new.png';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { BentoCard } from '@/components/ui/bento';
import lawyerStressedCall from '@/assets/lawyer-stressed-call.png';
import documentsStack from '@/assets/lawyer-documents-stack.png';
import documents3dIcons from '@/assets/3d-blue-icons.png';
import lawyerDocumentsBg from '@/assets/lawyer-documents-bg.png';
import mizenFeaturesRight from '@/assets/mizen-features-right.png';
const knowledgeBg1 = '/lovable-uploads/knowledge-scales-justice.png?v=2';
const knowledgeBg2 = '/lovable-uploads/knowledge-gavel.png?v=2';
const knowledgeBg3 = '/lovable-uploads/knowledge-people.png';
const knowledgeBg4 = '/lovable-uploads/knowledge-document.png';
import chatInterface from '@/assets/chat-interface.png';
import featuresPlaceholder from '@/assets/features-placeholder.png';
import buttonBg from '@/assets/button-bg-new.png';
import { GeminiEffectSection } from '@/components/GeminiEffectSection';
import { PointerHighlight } from '@/components/ui/pointer-highlight';
import featureRedige from '@/assets/feature-redige.png';
import featureAnalyse from '@/assets/feature-analyse.png';
import featureRecherche from '@/assets/feature-recherche.png';
import footerBg from '@/assets/footer-bg.png';
import { StaggerTestimonials } from '@/components/ui/stagger-testimonials';
import mizenDevices from '@/assets/mizen-devices.png';
import mizenCharacter from '@/assets/mizen-character.png';

import '../indexLanding.css';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('assistant');
  const [chatInput, setChatInput] = useState('');
  const [showAIResponse, setShowAIResponse] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const { t } = useTranslation();
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

      {/* Hero Section - Centered Layout */}
      <section className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* New background image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBgNew} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        
             {/* CTA Button - Right */}
             <div className="flex items-center absolute top-8 right-8 z-10">
             <Link to="/app">
               <LiquidGlassButton variant="default" size="sm" className="bg-mezin-ciel text-white border-white hover:bg-mezin backdrop-blur-sm">
                 Commencer
               </LiquidGlassButton>
             </Link>
             </div>


        <div className="mx-auto w-full relative z-10 flex flex-col items-center">
          {/* Centered Content */}
          <div className="text-center w-full">
           
              
              <h1 className="mb-4 text-white text-2xl md:text-7xl">
                {t.hero.meetMizen}
                <span className="text-mezin-ciel text-2xl md:text-7xl"> AI</span> 
              </h1>
            
            <h1 className="font-serif font-normal leading-[0.85] mb-8 text-center flex flex-wrap justify-center items-baseline gap-4" style={{ fontSize: 'clamp(40px, 16vw, 550px)', letterSpacing: '-0.02em' }}>
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent text-9xl md:text-9xl" style={{lineHeight:'1.2'}}>
                {t.hero.title}
              </span>
              <PointerHighlight
                rectangleClassName="border-white/30 border-2"
                pointerClassName="text-white"
                containerClassName="inline-block"
              >
                <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent px-6 text-7xl md:text-7xl">
                  {t.hero.titleHighlight}
                </span>
              </PointerHighlight>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mb-8 mx-auto max-w-lg font-light">
              {t.hero.subtitle}
            </p>

            {/* Chat Input Bar */}
            <div className="relative mb-8 mx-auto max-w-2xl">
              <div className="relative flex items-center gap-3">
                {/* Language Selector Dropdown */}
                <LanguageSelector />

                {/* Search Input */}
                <div className="relative flex-1">
                  <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={handleKeyPress} placeholder={t.hero.placeholder} className="w-full px-6 py-4 pr-16 text-foreground placeholder-muted-foreground bg-white border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-mezin-ciel focus:border-mezin-ciel transition-all duration-300 shadow-lg" />
                  <button onClick={handleChatSubmit} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-mezin-ciel hover:bg-mezin-ciel/90 rounded-xl transition-all duration-200 group">
                    <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-0.5 transition-transform duration-200" />
                  </button>
                </div>
              </div>

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
                            <span className="text-white/70 ml-2">{t.hero.aiThinking}</span>
                          </div>}
                      </div>
                      {aiResponse && <button onClick={() => navigate('/app')} className="text-blue-300 hover:text-blue-200 text-sm font-medium mt-3 transition-colors duration-200">
                          {t.hero.viewMore}
                        </button>}
                    </div>
                  </div>
                </div>}
            </div>

            {/* Testimonial avec avatars */}
            <div className="flex items-center justify-center gap-4 mb-20">
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
                {t.hero.testimonialText}
              </p>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <ChevronDown className="h-6 w-6 text-white/40" />
          </div>
        </div>
      </section>

      {/* Pitch Section - Compact & Visual */}
      <section className="py-20 md:py-28 px-6 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-mezin-ciel/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Main Pitch */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mezin-ciel/10 border border-mezin-ciel/20 text-mezin-ciel text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Propulsé par l'IA
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-mezin leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
              L'assistant qui comprend
              <br />
              <span className="text-mezin-ciel">le droit marocain.</span>
            </h2>
            
            <p className="text-lg text-mezin/60 max-w-2xl mx-auto">
              Recherche, rédaction, analyse — Mezin gère la complexité pour que vous restiez concentré sur l'essentiel.
            </p>
          </motion.div>

          {/* Three Pillars - Visual Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-2xl p-8 border border-border/50 hover:border-mezin-ciel/30 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mezin-ciel to-mezin-ciel/80 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-mezin mb-3">Recherche instantanée</h3>
              <p className="text-mezin/60 leading-relaxed">
                Trouvez articles, jurisprudences et modèles en quelques secondes.
              </p>
            </motion.div>

            {/* Pillar 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-2xl p-8 border border-border/50 hover:border-mezin-ciel/30 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mezin to-mezin/80 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-mezin mb-3">Analyse intelligente</h3>
              <p className="text-mezin/60 leading-relaxed">
                Synthèse de documents, détection de risques, recommandations claires.
              </p>
            </motion.div>

            {/* Pillar 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-2xl p-8 border border-border/50 hover:border-mezin-ciel/30 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-mezin mb-3">Rédaction accélérée</h3>
              <p className="text-mezin/60 leading-relaxed">
                Générez contrats, conclusions et courriers adaptés à votre contexte.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={lawyerDocumentsBg} 
            alt="Lawyer with documents" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 to-slate-900/40"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Content */}
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-white leading-tight">
                {t.integration.title}
              </h2>
              
              <p className="text-lg text-white/70">
                {t.integration.subtitle}
              </p>

              {/* Integration Icons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm flex items-center gap-2">
                  <span className="text-orange-500">📧</span> {t.integration.email}
                </div>
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm flex items-center gap-2">
                  <span className="text-orange-500">📅</span> {t.integration.calendar}
                </div>
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm flex items-center gap-2">
                  <span className="text-orange-500">📞</span> {t.integration.phone}
                </div>
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm flex items-center gap-2">
                  <span className="text-orange-500">💼</span> {t.integration.legalTools}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Features Section - Unified Block */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-[1400px] mx-auto space-y-48">
          
          {/* Feature 1 - Rédige plus vite */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column - Visual (60%) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-7"
            >
              <div className="relative overflow-hidden aspect-[16/9] rounded-md">
                <img src={featureRedige} alt="Interface de rédaction Mizen AI" className="w-full h-full object-cover" />
              </div>
            </motion.div>

            {/* Right Column - Text Content (40%) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="lg:col-span-5 space-y-12"
            >
              <div className="space-y-6">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-500">
                  RÉDACTION INTELLIGENTE
                </p>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal leading-[1.1]" style={{ color: '#0B2344' }}>
                  Rédige plus vite
                </h2>
              </div>

              <Accordion type="single" collapsible className="w-full space-y-0">
                <AccordionItem value="item-1" className="border-b border-gray-200">
                  <AccordionTrigger className="text-left text-base font-normal hover:no-underline py-5 text-gray-900">
                    Standards personnalisés
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 pb-5 leading-relaxed">
                    Mizen rédige, corrige et reformule vos contrats, conclusions et courriers selon vos propres standards. L'IA comprend le contexte et applique votre logique juridique.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border-b border-gray-200">
                  <AccordionTrigger className="text-left text-base font-normal hover:no-underline py-5 text-gray-900">
                    Documents prêts à l'emploi
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 pb-5 leading-relaxed">
                    Vous partez d'une idée ; Mizen en fait un document professionnel prêt à signer en quelques secondes.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border-b border-gray-200">
                  <AccordionTrigger className="text-left text-base font-normal hover:no-underline py-5 text-gray-900">
                    Gain de temps massif
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 pb-5 leading-relaxed">
                    Réduisez drastiquement le temps passé sur la rédaction tout en maintenant la qualité juridique.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>

          {/* Feature 2 - Analyse plus juste */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column - Text Content (40%) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-5 space-y-12"
            >
              <div className="space-y-6">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-500">
                  ANALYSE EXPERTE
                </p>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal leading-[1.1]" style={{ color: '#0B2344' }}>
                  Analyse plus juste
                </h2>
              </div>

              <Accordion type="single" collapsible className="w-full space-y-0">
                <AccordionItem value="item-1" className="border-b border-gray-200">
                  <AccordionTrigger className="text-left text-base font-normal hover:no-underline py-5 text-gray-900">
                    Détection des risques
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 pb-5 leading-relaxed">
                    L'IA entraînée sur la pratique juridique détecte les déséquilibres, oublis et risques cachés dans vos documents.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border-b border-gray-200">
                  <AccordionTrigger className="text-left text-base font-normal hover:no-underline py-5 text-gray-900">
                    Corrections guidées
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 pb-5 leading-relaxed">
                    Mizen vous indique comment corriger les problèmes avec des recommandations concrètes et applicables.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border-b border-gray-200">
                  <AccordionTrigger className="text-left text-base font-normal hover:no-underline py-5 text-gray-900">
                    Relecture stratégique
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 pb-5 leading-relaxed">
                    Des relectures précises, rapides et sans approximation pour une analyse juridique approfondie.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>

            {/* Right Column - Visual (60%) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="lg:col-span-7"
            >
              <div className="relative overflow-hidden aspect-[16/9] rounded-md">
                <img src={featureAnalyse} alt="Interface d'analyse Mizen AI" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>

          {/* Feature 3 - Cherche plus loin */}
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column - Visual (60%) */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="lg:col-span-7"
              >
                <div className="relative overflow-hidden aspect-[16/9] rounded-md">
                  <img src={featureRecherche} alt="Interface de recherche Mizen AI" className="w-full h-full object-cover" />
                </div>
              </motion.div>

              {/* Right Column - Text Content (40%) */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="lg:col-span-5 space-y-12"
              >
                <div className="space-y-6">
                  <p className="text-xs font-bold tracking-widest uppercase text-gray-500">
                    RECHERCHE APPROFONDIE
                  </p>

                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal leading-[1.1]" style={{ color: '#0B2344' }}>
                    Cherche plus loin
                  </h2>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-0">
                  <AccordionItem value="item-1" className="border-b border-gray-200">
                    <AccordionTrigger className="text-left text-base font-normal hover:no-underline py-5 text-gray-900">
                      Recherche complète
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600 pb-5 leading-relaxed">
                      Jurisprudence, articles et clauses similaires accessibles directement dans Mizen, bases internes et externes.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2" className="border-b border-gray-200">
                    <AccordionTrigger className="text-left text-base font-normal hover:no-underline py-5 text-gray-900">
                      Pertinence maximale
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600 pb-5 leading-relaxed">
                      L'IA trouve la référence la plus pertinente à votre argumentation en quelques secondes.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3" className="border-b border-gray-200">
                    <AccordionTrigger className="text-left text-base font-normal hover:no-underline py-5 text-gray-900">
                      Recherche efficace
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600 pb-5 leading-relaxed">
                      Transformez vos recherches en atout stratégique plutôt qu'en perte de temps.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            </div>

            {/* 4 Knowledge Cards - Full Width Below */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-16"
            >
              <p className="text-sm font-semibold text-gray-500 mb-6 uppercase tracking-wider">
                Base de connaissances
              </p>
              <div className="grid grid-cols-4 gap-6">
                {/* Card 1 */}
                <div className="group flex flex-col">
                  <div className="relative overflow-hidden aspect-[3/4] rounded-t-xl border-2 border-border/30 bg-muted/20" style={{
                    backgroundImage: `
                      linear-gradient(rgba(200, 200, 200, 0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(200, 200, 200, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '10px 10px',
                    backgroundPosition: '0 0, 0 0'
                  }}>
                    <img 
                      src={knowledgeBg1} 
                      alt="Code Civil" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="bg-card border-2 border-t-0 border-border/30 rounded-b-xl p-5 space-y-2">
                    <h3 className="text-foreground text-base font-bold">
                      Code Civil
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Accès complet
                    </p>
                    <div className="text-primary text-sm font-semibold">+2 500 textes</div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="group flex flex-col">
                  <div className="relative overflow-hidden aspect-[3/4] rounded-t-xl border-2 border-border/30 bg-muted/20" style={{
                    backgroundImage: `
                      linear-gradient(rgba(200, 200, 200, 0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(200, 200, 200, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '10px 10px',
                    backgroundPosition: '0 0, 0 0'
                  }}>
                    <img 
                      src={knowledgeBg2} 
                      alt="Jurisprudence" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="bg-card border-2 border-t-0 border-border/30 rounded-b-xl p-5 space-y-2">
                    <h3 className="text-foreground text-base font-bold">
                      Jurisprudence
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Décisions de justice
                    </p>
                    <div className="text-primary text-sm font-semibold">+15 000 décisions</div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="group flex flex-col">
                  <div className="relative overflow-hidden aspect-[3/4] rounded-t-xl border-2 border-border/30 bg-muted/20" style={{
                    backgroundImage: `
                      linear-gradient(rgba(200, 200, 200, 0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(200, 200, 200, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '10px 10px',
                    backgroundPosition: '0 0, 0 0'
                  }}>
                    <img 
                      src={knowledgeBg3} 
                      alt="Droit Commercial" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="bg-card border-2 border-t-0 border-border/30 rounded-b-xl p-5 space-y-2">
                    <h3 className="text-foreground text-base font-bold">
                      Droit Commercial
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Législation commerciale
                    </p>
                    <div className="text-primary text-sm font-semibold">+3 200 articles</div>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="group flex flex-col">
                  <div className="relative overflow-hidden aspect-[3/4] rounded-t-xl border-2 border-border/30 bg-muted/20" style={{
                    backgroundImage: `
                      linear-gradient(rgba(200, 200, 200, 0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(200, 200, 200, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '10px 10px',
                    backgroundPosition: '0 0, 0 0'
                  }}>
                    <img 
                      src={knowledgeBg4} 
                      alt="Modèles Types" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="bg-card border-2 border-t-0 border-border/30 rounded-b-xl p-5 space-y-2">
                    <h3 className="text-foreground text-base font-bold">
                      Modèles Types
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Documents juridiques
                    </p>
                    <div className="text-primary text-sm font-semibold">+800 modèles</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Meet Mizen Section */}
      <section className="py-24 md:py-32 px-6 bg-background overflow-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Top - Title & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mezin-ciel/10 border border-mezin-ciel/20 mb-6">
              <Sparkles className="w-4 h-4 text-mezin-ciel" />
              <span className="text-sm font-semibold text-mezin-ciel">Rencontrez votre assistant</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-foreground leading-tight mb-6">
              Voici <span className="text-mezin-ciel">Mizen</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Mizen est bien plus qu'un simple outil. C'est votre partenaire intelligent, conçu spécifiquement pour les avocats marocains.
            </p>
          </motion.div>

          {/* Middle - Image with 4 Points on sides */}
          <div className="relative flex items-center justify-center gap-8 lg:gap-16 mb-16">
            {/* Left Points */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="hidden md:flex flex-col gap-8 flex-1 items-end"
            >
              <div className="text-right max-w-xs">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Intelligence contextuelle</h4>
                <p className="text-sm text-muted-foreground">Comprend le droit marocain dans toutes ses nuances et spécificités locales</p>
              </div>
              <div className="text-right max-w-xs">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-mezin-ciel/10 mb-3">
                  <MessageSquare className="w-6 h-6 text-mezin-ciel" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Dialogue naturel</h4>
                <p className="text-sm text-muted-foreground">Communiquez en français, arabe ou darija comme avec un collègue</p>
              </div>
            </motion.div>

            {/* Center - Circular Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
              className="relative flex-shrink-0"
            >
              {/* Decorative rings */}
              <div className="absolute inset-0 w-64 h-64 md:w-80 md:h-80 rounded-full border-2 border-mezin-ciel/20 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 scale-110"></div>
              <div className="absolute inset-0 w-64 h-64 md:w-80 md:h-80 rounded-full border border-primary/10 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 scale-125"></div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 w-64 h-64 md:w-80 md:h-80 rounded-full bg-mezin-ciel/20 blur-3xl -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"></div>
              
              {/* Main circular image */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl border-4 border-background ring-1 ring-mezin-ciel/30">
                <img 
                  src={mizenCharacter} 
                  alt="Mizen - Votre assistant juridique IA" 
                  className="w-full h-full object-cover scale-150 object-[35%_center]"
                />
              </div>
            </motion.div>

            {/* Right Points */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="hidden md:flex flex-col gap-8 flex-1 items-start"
            >
              <div className="text-left max-w-xs">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Précision juridique</h4>
                <p className="text-sm text-muted-foreground">Réponses fiables basées sur une base de données juridique exhaustive</p>
              </div>
              <div className="text-left max-w-xs">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-mezin-ciel/10 mb-3">
                  <Zap className="w-6 h-6 text-mezin-ciel" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Rapidité d'exécution</h4>
                <p className="text-sm text-muted-foreground">Obtenez des réponses en quelques secondes, pas en heures de recherche</p>
              </div>
            </motion.div>
          </div>

          {/* Mobile Points Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-6 md:hidden"
          >
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Intelligence contextuelle</h4>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-mezin-ciel/10 mb-3">
                <MessageSquare className="w-6 h-6 text-mezin-ciel" />
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Dialogue naturel</h4>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Précision juridique</h4>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-mezin-ciel/10 mb-3">
                <Zap className="w-6 h-6 text-mezin-ciel" />
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Rapidité d'exécution</h4>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section - Two Plans */}
      <section id="pricing" className="py-20 md:py-32 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mezin-ciel/10 border border-mezin-ciel/20 mb-6">
              <svg className="w-4 h-4 text-mezin-ciel" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-semibold text-mezin-ciel">Tarification simple</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-foreground leading-tight mb-6">
              Choisissez votre <span className="text-mezin-ciel">formule</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Des offres adaptées à vos besoins, sans engagement.
            </p>
          </motion.div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Essential Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="relative bg-card border border-border/50 rounded-3xl p-8 md:p-10"
            >
              <div className="space-y-6">
                {/* Plan Name */}
                <div>
                  <h3 className="text-2xl md:text-3xl font-serif font-normal text-foreground mb-2">Essential</h3>
                  <p className="text-muted-foreground">Pour commencer avec Mizen</p>
                </div>

                {/* Price */}
                <div className="py-6 border-y border-border/50">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl md:text-6xl font-bold text-foreground">349</span>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-foreground">MAD</span>
                      <span className="text-sm text-muted-foreground">/mois</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-mezin-ciel/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-mezin-ciel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-foreground">Conversations illimitées (fair use professionnel)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-mezin-ciel/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-mezin-ciel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-foreground">Upload de documents limité</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-mezin-ciel/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-mezin-ciel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-foreground">Toutes les fonctionnalités core (chat + espaces de travail + modèles)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-mezin-ciel/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-mezin-ciel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-foreground">Support standard</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => navigate('/app')}
                  className="w-full group px-8 py-4 bg-foreground/10 hover:bg-foreground/20 text-foreground font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <span>Commencer</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative bg-card border-2 border-mezin-ciel rounded-3xl p-8 md:p-10"
            >
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1.5 bg-mezin-ciel text-white text-sm font-bold rounded-full">
                  Recommandé
                </div>
              </div>

              <div className="space-y-6">
                {/* Plan Name */}
                <div>
                  <h3 className="text-2xl md:text-3xl font-serif font-normal text-foreground mb-2">Pro</h3>
                  <p className="text-muted-foreground">Pour les professionnels exigeants</p>
                </div>

                {/* Price */}
                <div className="py-6 border-y border-border/50">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl md:text-6xl font-bold text-mezin-ciel">499</span>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-foreground">MAD</span>
                      <span className="text-sm text-muted-foreground">/mois</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-mezin-ciel/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-mezin-ciel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-foreground">Conversations illimitées (fair use professionnel)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-mezin-ciel/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-mezin-ciel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-foreground">Documents illimités + dossiers illimités</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-mezin-ciel/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-mezin-ciel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-foreground">Mini-Word rédaction avancée</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-mezin-ciel/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-mezin-ciel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-foreground">Support prioritaire</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-mezin-ciel/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-mezin-ciel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-foreground">Réponses prioritaires plus rapides</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => navigate('/app')}
                  className="w-full group px-8 py-4 bg-mezin-ciel hover:bg-mezin-ciel/90 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <span>Commencer avec Pro</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Satisfaction Guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto mt-12"
          >
            <div className="p-5 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-center gap-4">
                <svg className="w-8 h-8 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h5 className="font-semibold text-foreground mb-1">Garantie satisfait ou remboursé — 30 jours</h5>
                  <p className="text-sm text-muted-foreground">
                    Testez sans risque. Pas convaincu ? Remboursement intégral.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Certifications Section */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden" style={{ 
        background: 'linear-gradient(135deg, hsl(210, 80%, 12%) 0%, hsl(210, 80%, 16%) 100%)'
      }}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-white/60 text-sm font-semibold tracking-wider uppercase mb-6">
              Certifié & Conforme
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-normal text-white leading-tight max-w-4xl mx-auto">
              Mizen AI s'engage à maintenir la conformité avec les normes internationales de sécurité et de confidentialité les plus rigoureuses.
            </h2>
          </div>

          {/* Certifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-white/10">
            {/* ISO 27001 */}
            <div className="p-8 border-r border-b lg:border-b-0 border-white/10 flex flex-col">
              <h3 className="text-xl font-semibold text-white mb-3">
                ISO 27001
              </h3>
              <p className="text-white/70 text-sm mb-auto leading-relaxed">
                Notre système de gestion de la sécurité de l'information, conforme à la norme ISO 27001, garantit que les clients peuvent avoir confiance dans notre approche de la sécurité des données.
              </p>
              <div className="mt-8 flex justify-start">
                <div className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* ISO 27001 for AI */}
            <div className="p-8 border-r md:border-r-0 lg:border-r border-b lg:border-b-0 border-white/10 flex flex-col">
              <h3 className="text-xl font-semibold text-white mb-3">
                ISO 27001 pour l'IA
              </h3>
              <p className="text-white/70 text-sm mb-auto leading-relaxed">
                Notre gouvernance de l'IA, conforme à la norme ISO 27001, garantit que les clients peuvent avoir confiance dans notre implémentation sécurisée de l'intelligence artificielle.
              </p>
              <div className="mt-8 flex justify-start">
                <div className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* SOC Type 2 */}
            <div className="p-8 border-r border-b md:border-b-0 border-white/10 flex flex-col">
              <h3 className="text-xl font-semibold text-white mb-3">
                SOC Type 2
              </h3>
              <p className="text-white/70 text-sm mb-auto leading-relaxed">
                Nous répondons aux exigences SOC 2 pour garantir une gestion sécurisée et conforme des données sur l'ensemble de nos systèmes.
              </p>
              <div className="mt-8 flex justify-start">
                <div className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* GDPR */}
            <div className="p-8 flex flex-col">
              <h3 className="text-xl font-semibold text-white mb-3">
                RGPD
              </h3>
              <p className="text-white/70 text-sm mb-auto leading-relaxed">
                Avec notre équipe technique basée au Maroc, nous opérons conformément au RGPD, la norme mondiale la plus stricte en matière de confidentialité des données.
              </p>
              <div className="mt-8 flex justify-start">
                <div className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center relative">
                  <div className="absolute inset-2 flex items-center justify-center">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                          transform: `rotate(${i * 30}deg) translateY(-18px)`,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-white">RGPD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="temoignages" className="py-32 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="text-center max-w-[540px] mx-auto mb-16"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif font-normal tracking-tighter mb-5">
              {t.testimonials.title.split('Mizen AI')[0]}<span className="text-mezin-ciel">Mizen AI</span>
            </h2>
            <p className="opacity-75 text-center text-muted-foreground">
              {t.testimonials.subtitle}
            </p>
          </motion.div>

          {/* Testimonials Carousel */}
          <StaggerTestimonials />
        </div>
      </section>


      {/* Articles Section - Minimalist & Pro */}
      <section className="py-32 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-serif font-normal tracking-[-0.03em] mb-6">
              Articles & Ressources
            </h2>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
              Explorez nos guides et articles pour maîtriser l'IA juridique
            </p>
          </div>

          {/* Grid container with border lines */}
          <div className="relative">
            {/* Horizontal lines */}
            <div className="absolute inset-x-0 top-0 h-px bg-border/20"></div>
            <div className="absolute inset-x-0 bottom-0 h-px bg-border/20"></div>
            
            {/* Vertical lines for desktop */}
            <div className="hidden md:block absolute inset-y-0 left-0 w-px bg-border/20"></div>
            <div className="hidden md:block absolute inset-y-0 left-1/3 w-px bg-border/20"></div>
            <div className="hidden md:block absolute inset-y-0 left-2/3 w-px bg-border/20"></div>
            <div className="hidden md:block absolute inset-y-0 right-0 w-px bg-border/20"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3">
              {/* Article 1 */}
              <article className="group cursor-pointer p-8 border-b md:border-b-0 md:border-r border-border">
                <div className="aspect-[4/3] bg-muted mb-6 overflow-hidden">
                  <img 
                    src={articleOfficeMorocco} 
                    alt="Bureau d'avocat moderne au Maroc"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="space-y-3">
                  <span className="text-sm text-mezin-ciel font-semibold">Guide</span>
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-mezin-ciel transition-colors">
                    Comment l'IA transforme le droit au Maroc
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Découvrez comment l'intelligence artificielle révolutionne la pratique juridique et optimise votre efficacité.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                    <span>5 min de lecture</span>
                    <span>•</span>
                    <span>Janvier 2025</span>
                  </div>
                </div>
              </article>

              {/* Article 2 */}
              <article className="group cursor-pointer p-8 border-b md:border-b-0 md:border-r border-border">
                <div className="aspect-[4/3] bg-muted mb-6 overflow-hidden">
                  <img 
                    src={articleLawyersMorocco} 
                    alt="Avocats marocains en consultation"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="space-y-3">
                  <span className="text-sm text-mezin-ciel font-semibold">Sécurité</span>
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-mezin-ciel transition-colors">
                    Protection des données juridiques sensibles
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Comprenez nos mesures de sécurité et comment nous protégeons vos informations confidentielles.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                    <span>7 min de lecture</span>
                    <span>•</span>
                    <span>Janvier 2025</span>
                  </div>
                </div>
              </article>

              {/* Article 3 */}
              <article className="group cursor-pointer p-8">
                <div className="aspect-[4/3] bg-muted mb-6 overflow-hidden">
                  <img 
                    src={articleMoroccoFlag} 
                    alt="Drapeau du Maroc et palais de justice"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="space-y-3">
                  <span className="text-sm text-mezin-ciel font-semibold">Tutoriel</span>
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-mezin-ciel transition-colors">
                    Premiers pas avec Mizen AI
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Un guide complet pour démarrer rapidement et tirer le meilleur parti de notre plateforme.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                    <span>10 min de lecture</span>
                    <span>•</span>
                    <span>Décembre 2024</span>
                  </div>
                </div>
              </article>
            </div>
          </div>

          {/* CTA to view all articles */}
          <div className="text-center mt-16">
            <button className="px-8 py-3 border border-border rounded-xl text-foreground hover:bg-muted transition-all duration-200 font-medium">
              Voir tous les articles
            </button>
          </div>
        </div>
      </section>


      

      {/* CTA Section */}
      

      {/* Footer */}
      <footer className="relative overflow-hidden py-16 px-6" style={{ 
        backgroundImage: `url(${footerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Logo & Description */}
            <div className="md:col-span-1">
              <h3 className="text-2xl font-serif font-normal mb-6">
                <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Mizen <span className="text-mezin-ciel">AI</span>
                </span>
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                {t.footer.description}
              </p>
            </div>

            {/* Produit */}
            <div>
              <h4 className="text-white font-serif font-semibold mb-6">{t.footer.product}</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-white/70 hover:text-white transition-colors text-sm">{t.footer.features}</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">{t.footer.pricing}</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Sécurité</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">API</a></li>
              </ul>
            </div>

            {/* Ressources */}
            <div>
              <h4 className="text-white font-serif font-semibold mb-6">Ressources</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Documentation</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Blog</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Articles</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">{t.footer.support}</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-serif font-semibold mb-6">{t.footer.contact}</h4>
              <ul className="space-y-3">
                <li><a href="#contact" className="text-white/70 hover:text-white transition-colors text-sm">Nous contacter</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Mentions légales</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">{t.footer.privacy}</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">{t.footer.terms}</a></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/60 text-sm">
                © 2024 Mizen AI. {t.footer.rights}
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Politique de cookies</a>
                <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">RGPD</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Landing;