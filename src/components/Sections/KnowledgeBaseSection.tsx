import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, Download, BookOpen, ArrowLeft, Scale, FileSignature, Briefcase, Home, Users, Building, Gavel, ScrollText, FileCheck } from "lucide-react";
import { toast } from "sonner";

// Legal sources data
const legalSources = [
  {
    id: "code-penal",
    title: "Le Code pénal marocain",
    description: "Ensemble des lois définissant les infractions et fixant les peines applicables",
    icon: Scale,
    articles: [
      { id: "477", title: "Article 477", content: "Quiconque, par fraude ou violence, enlève ou fait enlever un mineur de moins de dix-huit ans..." },
      { id: "485", title: "Article 485", content: "Est puni de la réclusion de cinq à dix ans tout attentat à la pudeur consommé ou tenté..." },
      { id: "496", title: "Article 496", content: "Quiconque, par violence, contrainte ou menace, a commis un viol, est puni de la réclusion..." },
    ],
    downloadUrl: "/documents/code-penal-maroc.pdf"
  },
  {
    id: "code-procedure",
    title: "Le Code de procédure pénale",
    description: "Règles régissant le déroulement du procès pénal",
    icon: Gavel,
    articles: [
      { id: "1", title: "Article 1", content: "L'action publique pour l'application des peines est mise en mouvement et exercée par les magistrats..." },
      { id: "45", title: "Article 45", content: "La police judiciaire est exercée, sous la direction du procureur du Roi..." },
      { id: "73", title: "Article 73", content: "Les officiers de police judiciaire peuvent, en cas de crime flagrant..." },
    ],
    downloadUrl: "/documents/code-procedure-penale-maroc.pdf"
  },
  {
    id: "code-civil",
    title: "Le Code civil (D.O.C)",
    description: "Dahir formant Code des Obligations et Contrats",
    icon: FileText,
    articles: [
      { id: "618", title: "Article 618", content: "Le contrat est une convention par laquelle une ou plusieurs personnes s'obligent..." },
      { id: "723", title: "Article 723", content: "Toute obligation doit être exécutée de bonne foi..." },
      { id: "769", title: "Article 769", content: "Le débiteur répond du dommage causé par son inexécution..." },
    ],
    downloadUrl: "/documents/code-civil-maroc.pdf"
  },
  {
    id: "code-travail",
    title: "Le Code du travail",
    description: "Loi n° 65-99 relative au Code du travail",
    icon: Users,
    articles: [
      { id: "1", title: "Article 1", content: "Est considérée comme salariée toute personne qui s'engage à exercer son activité..." },
      { id: "14", title: "Article 14", content: "La période d'essai est la période pendant laquelle chacune des parties peut rompre..." },
      { id: "152", title: "Article 152", content: "La durée normale du travail des salariés est fixée à 2288 heures par année..." },
    ],
    downloadUrl: "/documents/code-travail-maroc.pdf"
  },
  {
    id: "code-commerce",
    title: "Le Code de commerce",
    description: "Loi n° 15-95 formant Code de Commerce",
    icon: Briefcase,
    articles: [
      { id: "comm-1", title: "Article 1", content: "Les commerçants sont ceux qui exercent des actes de commerce et en font leur profession habituelle..." },
      { id: "comm-2", title: "Article 2", content: "La qualité de commerçant s'acquiert par l'exercice habituel ou professionnel des activités..." },
    ],
    downloadUrl: "/documents/code-commerce-maroc.pdf"
  },
  {
    id: "code-famille",
    title: "Le Code de la famille (Moudawana)",
    description: "Loi n° 70-03 portant Code de la famille",
    icon: Home,
    articles: [
      { id: "fam-1", title: "Article 1", content: "Le présent code est dénommé Code de la Famille. Il est désigné dans la présente loi par le Code..." },
      { id: "fam-4", title: "Article 4", content: "Le mariage a pour buts la vie dans la fidélité, la pureté et le désir de procréation..." },
    ],
    downloadUrl: "/documents/code-famille-maroc.pdf"
  },
  {
    id: "structure-judiciaire",
    title: "La structure judiciaire du Maroc",
    description: "Organisation des tribunaux et procédures judiciaires",
    icon: Building,
    articles: [
      { id: "org-1", title: "Organisation Judiciaire - Article 1", content: "La justice est rendue sur l'ensemble du territoire du Royaume au nom de Sa Majesté le Roi..." },
      { id: "org-2", title: "Tribunaux de Première Instance", content: "Les tribunaux de première instance sont compétents pour connaître de toutes les affaires..." },
      { id: "org-3", title: "Cours d'Appel", content: "Les cours d'appel connaissent des appels des jugements des tribunaux de première instance..." },
    ],
    downloadUrl: "/documents/organisation-judiciaire-maroc.pdf"
  },
];

// Document templates data
const documentTemplates = [
  {
    id: "contrat-travail-cdi",
    title: "Contrat de Travail CDI",
    description: "Modèle de contrat de travail à durée indéterminée conforme au Code du travail marocain",
    icon: FileSignature,
    category: "Travail",
    downloadUrl: "/templates/contrat-travail-cdi.docx"
  },
  {
    id: "contrat-travail-cdd",
    title: "Contrat de Travail CDD",
    description: "Modèle de contrat de travail à durée déterminée",
    icon: FileSignature,
    category: "Travail",
    downloadUrl: "/templates/contrat-travail-cdd.docx"
  },
  {
    id: "lettre-licenciement",
    title: "Lettre de Licenciement",
    description: "Modèle de notification de licenciement conforme à la procédure légale",
    icon: FileText,
    category: "Travail",
    downloadUrl: "/templates/lettre-licenciement.docx"
  },
  {
    id: "contrat-bail-commercial",
    title: "Contrat de Bail Commercial",
    description: "Modèle de bail commercial pour locaux professionnels",
    icon: Building,
    category: "Immobilier",
    downloadUrl: "/templates/bail-commercial.docx"
  },
  {
    id: "contrat-bail-habitation",
    title: "Contrat de Bail d'Habitation",
    description: "Modèle de contrat de location résidentielle",
    icon: Home,
    category: "Immobilier",
    downloadUrl: "/templates/bail-habitation.docx"
  },
  {
    id: "promesse-vente",
    title: "Promesse de Vente Immobilière",
    description: "Modèle de compromis de vente pour bien immobilier",
    icon: FileSignature,
    category: "Immobilier",
    downloadUrl: "/templates/promesse-vente.docx"
  },
  {
    id: "statuts-sarl",
    title: "Statuts SARL",
    description: "Modèle de statuts pour Société à Responsabilité Limitée",
    icon: ScrollText,
    category: "Sociétés",
    downloadUrl: "/templates/statuts-sarl.docx"
  },
  {
    id: "statuts-sa",
    title: "Statuts SA",
    description: "Modèle de statuts pour Société Anonyme",
    icon: ScrollText,
    category: "Sociétés",
    downloadUrl: "/templates/statuts-sa.docx"
  },
  {
    id: "pv-assemblee",
    title: "PV d'Assemblée Générale",
    description: "Modèle de procès-verbal d'assemblée générale ordinaire",
    icon: FileCheck,
    category: "Sociétés",
    downloadUrl: "/templates/pv-ag.docx"
  },
  {
    id: "plainte",
    title: "Modèle de Plainte",
    description: "Format standard pour déposer une plainte auprès des autorités",
    icon: FileText,
    category: "Procédure",
    downloadUrl: "/templates/modele-plainte.docx"
  },
  {
    id: "mise-demeure",
    title: "Mise en Demeure",
    description: "Modèle de lettre de mise en demeure",
    icon: FileText,
    category: "Procédure",
    downloadUrl: "/templates/mise-demeure.docx"
  },
  {
    id: "procuration",
    title: "Procuration",
    description: "Modèle de procuration générale ou spéciale",
    icon: FileSignature,
    category: "Civil",
    downloadUrl: "/templates/procuration.docx"
  },
  {
    id: "contrat-vente",
    title: "Contrat de Vente",
    description: "Modèle de contrat de vente de bien mobilier",
    icon: FileSignature,
    category: "Civil",
    downloadUrl: "/templates/contrat-vente.docx"
  },
  {
    id: "contrat-prestation",
    title: "Contrat de Prestation de Services",
    description: "Modèle de contrat pour prestation de services professionnels",
    icon: Briefcase,
    category: "Commercial",
    downloadUrl: "/templates/contrat-prestation.docx"
  },
  {
    id: "nda",
    title: "Accord de Confidentialité (NDA)",
    description: "Modèle d'accord de non-divulgation bilatéral",
    icon: FileCheck,
    category: "Commercial",
    downloadUrl: "/templates/nda.docx"
  },
];

const KnowledgeBaseSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("sources");
  const [filteredSources, setFilteredSources] = useState(legalSources);
  const [filteredTemplates, setFilteredTemplates] = useState(documentTemplates);
  const [selectedSource, setSelectedSource] = useState<typeof legalSources[0] | null>(null);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    
    if (query.trim() === "") {
      setFilteredSources(legalSources);
      setFilteredTemplates(documentTemplates);
      return;
    }

    setFilteredSources(legalSources.filter(source => 
      source.title.toLowerCase().includes(query) || 
      source.description.toLowerCase().includes(query) ||
      source.articles.some(article => 
        article.title.toLowerCase().includes(query) || 
        article.content.toLowerCase().includes(query)
      )
    ));

    setFilteredTemplates(documentTemplates.filter(template =>
      template.title.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.category.toLowerCase().includes(query)
    ));
  }, [searchQuery]);

  const handleSourceClick = (source: typeof legalSources[0]) => {
    setSelectedSource(source);
  };

  const handleBackClick = () => {
    setSelectedSource(null);
  };

  const handleDownloadClick = (url: string, title: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    toast.success(`Téléchargement de "${title}" en cours...`);
  };

  // Group templates by category
  const templatesByCategory = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof documentTemplates>);

  return (
    <div className="h-full flex flex-col p-6 bg-background">
      {/* Header */}
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Base de connaissances juridiques
        </h1>
        <p className="text-muted-foreground">Sources juridiques marocaines et modèles de documents</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-4">
          <TabsTrigger value="sourcesRag" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Sources Juridiques Rag
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <FileSignature className="h-4 w-4" />
            Sources Juridiques
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileSignature className="h-4 w-4" />
            Modèles de Documents
          </TabsTrigger>
        </TabsList>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={activeTab === "sources" 
              ? "Rechercher dans les codes et articles juridiques..." 
              : "Rechercher un modèle de document ou contrat..."}
            className="w-full max-w-lg pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Sources Tab */}
        <TabsContent value="sourcesRag" className="flex-1 overflow-hidden m-0">
          {!selectedSource ? (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-1">
                {filteredSources.map((source) => {
                  const IconComponent = source.icon;
                  return (
                    <div 
                      key={source.id} 
                      className="flex items-center justify-between py-3 px-4 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors group border border-transparent hover:border-border/50"
                      onClick={() => handleSourceClick(source)}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                          <IconComponent className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-foreground truncate">{source.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{source.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                          {source.articles.length} articles
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleDownloadClick(source.downloadUrl, source.title, e)}
                          title="Télécharger"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {filteredSources.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    Aucune source trouvée pour "{searchQuery}"
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <Button variant="outline" size="sm" onClick={handleBackClick} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => handleDownloadClick(selectedSource.downloadUrl, selectedSource.title, e)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Télécharger le document complet
                </Button>
              </div>

              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <selectedSource.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">{selectedSource.title}</h2>
                      <p className="text-muted-foreground">{selectedSource.description}</p>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Articles principaux
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[150px]">Référence</TableHead>
                          <TableHead>Contenu</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSource.articles.map((article) => (
                          <TableRow key={article.id}>
                            <TableCell className="font-medium">{article.title}</TableCell>
                            <TableCell className="text-muted-foreground">{article.content}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="flex-1 overflow-hidden m-0">
          {!selectedSource ? (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-1">
                {filteredSources.map((source) => {
                  const IconComponent = source.icon;
                  return (
                    <div 
                      key={source.id} 
                      className="flex items-center justify-between py-3 px-4 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors group border border-transparent hover:border-border/50"
                      onClick={() => handleSourceClick(source)}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                          <IconComponent className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-foreground truncate">{source.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{source.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                          {source.articles.length} articles
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleDownloadClick(source.downloadUrl, source.title, e)}
                          title="Télécharger"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {filteredSources.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    Aucune source trouvée pour "{searchQuery}"
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <Button variant="outline" size="sm" onClick={handleBackClick} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => handleDownloadClick(selectedSource.downloadUrl, selectedSource.title, e)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Télécharger le document complet
                </Button>
              </div>

              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <selectedSource.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">{selectedSource.title}</h2>
                      <p className="text-muted-foreground">{selectedSource.description}</p>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Articles principaux
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[150px]">Référence</TableHead>
                          <TableHead>Contenu</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSource.articles.map((article) => (
                          <TableRow key={article.id}>
                            <TableCell className="font-medium">{article.title}</TableCell>
                            <TableCell className="text-muted-foreground">{article.content}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {Object.entries(templatesByCategory).map(([category, templates]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {templates.map((template) => {
                      const IconComponent = template.icon;
                      return (
                        <div
                          key={template.id}
                          className="flex items-center gap-3 py-3 px-4 rounded-lg bg-card border border-border/50 hover:border-primary/30 hover:bg-muted/20 transition-all"
                        >
                          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                            <IconComponent className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">{template.title}</h4>
                            <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadClick(template.downloadUrl, template.title)}
                            className="flex items-center gap-2 shrink-0"
                          >
                            <Download className="h-4 w-4" />
                            Utiliser
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredTemplates.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  Aucun modèle trouvé pour "{searchQuery}"
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border italic">
        Cette base de connaissances contient les sources juridiques marocaines et les modèles de documents utilisés pour entraîner notre modèle d'assistant juridique.
      </div>
    </div>
  );
};

export default KnowledgeBaseSection;
