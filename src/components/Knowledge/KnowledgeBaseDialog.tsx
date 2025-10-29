
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, Download, BookOpen } from "lucide-react";

interface KnowledgeBaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Legal sources data with expanded information
const legalSources = [
  {
    id: "code-penal",
    title: "Le Code pénal marocain",
    description: "Ensemble des lois définissant les infractions et fixant les peines applicables",
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
    articles: [
      { id: "1", title: "Article 1", content: "L'action publique pour l'application des peines est mise en mouvement et exercée par les magistrats..." },
      { id: "45", title: "Article 45", content: "La police judiciaire est exercée, sous la direction du procureur du Roi..." },
      { id: "73", title: "Article 73", content: "Les officiers de police judiciaire peuvent, en cas de crime flagrant..." },
    ],
    downloadUrl: "/documents/code-procedure-penale-maroc.pdf"
  },
  {
    id: "code-civil",
    title: "Le Code civil",
    description: "Lois régissant les rapports entre les personnes physiques ou morales",
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
    description: "Législation encadrant les relations employeur-employé",
    articles: [
      { id: "1", title: "Article 1", content: "Est considérée comme salariée toute personne qui s'engage à exercer son activité..." },
      { id: "14", title: "Article 14", content: "La période d'essai est la période pendant laquelle chacune des parties peut rompre..." },
      { id: "152", title: "Article 152", content: "La durée normale du travail des salariés est fixée à 2288 heures par année..." },
    ],
    downloadUrl: "/documents/code-travail-maroc.pdf"
  },
  {
    id: "autres-domaines",
    title: "Le droit commercial, immobilier, des sociétés, de la famille, des étrangers, etc.",
    description: "Ensemble des domaines juridiques spécialisés",
    articles: [
      { id: "comm-1", title: "Code de Commerce - Article 1", content: "Les commerçants sont ceux qui exercent des actes de commerce et en font leur profession habituelle..." },
      { id: "fam-1", title: "Code de la Famille - Article 1", content: "Le présent code est dénommé Code de la Famille. Il est désigné dans la présente loi par le Code..." },
      { id: "soc-1", title: "Loi sur les Sociétés - Article 1", content: "Les sociétés commerciales sont constituées par deux ou plusieurs personnes qui conviennent..." },
    ],
    downloadUrl: "/documents/codes-specialises-maroc.pdf"
  },
  {
    id: "structure-judiciaire",
    title: "La structure judiciaire du Maroc",
    description: "Procédures, tribunaux, délais, autorités compétentes",
    articles: [
      { id: "org-1", title: "Organisation Judiciaire - Article 1", content: "La justice est rendue sur l'ensemble du territoire du Royaume au nom de Sa Majesté le Roi..." },
      { id: "org-2", title: "Tribunaux de Première Instance", content: "Les tribunaux de première instance sont compétents pour connaître de toutes les affaires..." },
      { id: "org-3", title: "Cours d'Appel", content: "Les cours d'appel connaissent des appels des jugements des tribunaux de première instance..." },
    ],
    downloadUrl: "/documents/organisation-judiciaire-maroc.pdf"
  },
  {
    id: "documents-legaux",
    title: "Les documents légaux marocains courants",
    description: "Certificats médicaux, plaintes, PV de police, convocations, actes notariés, statuts, contrats de travail…",
    templates: [
      { id: "plainte", title: "Modèle de plainte", description: "Format standard pour déposer une plainte auprès des autorités", downloadUrl: "/templates/modele-plainte.docx" },
      { id: "contrat-travail", title: "Contrat de travail", description: "Contrat de travail standard conforme au Code du travail marocain", downloadUrl: "/templates/contrat-travail.docx" },
      { id: "statuts", title: "Statuts de société", description: "Modèle de statuts pour la création d'une SARL", downloadUrl: "/templates/statuts-sarl.docx" },
    ]
  },
];

const KnowledgeBaseDialog = ({ open, onOpenChange }: KnowledgeBaseDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSources, setFilteredSources] = useState(legalSources);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSource, setSelectedSource] = useState<any>(null);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSources(legalSources);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = legalSources.filter(source => 
      source.title.toLowerCase().includes(query) || 
      source.description.toLowerCase().includes(query) ||
      (source.articles && source.articles.some(article => 
        article.title.toLowerCase().includes(query) || 
        article.content.toLowerCase().includes(query)
      ))
    );
    
    setFilteredSources(filtered);
  }, [searchQuery]);

  const handleSourceClick = (source: any) => {
    setSelectedSource(source);
    setActiveTab("details");
  };

  const handleBackClick = () => {
    setActiveTab("overview");
    setSelectedSource(null);
  };

  const handleDownloadClick = (url: string, event: React.MouseEvent) => {
    event.stopPropagation();
    // In a real app, this would download the file
    console.log(`Downloading: ${url}`);
    // For now, just show a message
    alert(`Dans une version de production, ceci téléchargerait le document: ${url}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Base de connaissances juridiques
          </DialogTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher des codes, articles, ou sujets juridiques..."
              className="w-full pl-9 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedSource}>
              {selectedSource ? selectedSource.title.substring(0, 20) + "..." : "Détails"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4 py-2">
                {filteredSources.map((source) => (
                  <div 
                    key={source.id} 
                    className="border rounded-md p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => handleSourceClick(source)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-black mb-2">{source.title}</h3>
                      {source.downloadUrl && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => handleDownloadClick(source.downloadUrl, e)}
                          title="Télécharger le document"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{source.description}</p>
                    {source.articles && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {source.articles.length} articles disponibles
                      </div>
                    )}
                    {source.templates && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {source.templates.length} modèles disponibles
                      </div>
                    )}
                  </div>
                ))}

                {filteredSources.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    Aucun résultat trouvé pour "{searchQuery}"
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="details" className="flex-1 overflow-hidden">
            {selectedSource && (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <Button variant="outline" size="sm" onClick={handleBackClick}>
                    Retour
                  </Button>
                  {selectedSource.downloadUrl && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => handleDownloadClick(selectedSource.downloadUrl, e)}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Télécharger le document complet
                    </Button>
                  )}
                </div>

                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-black mb-1">{selectedSource.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{selectedSource.description}</p>
                    </div>

                    {selectedSource.articles && selectedSource.articles.length > 0 && (
                      <div>
                        <h4 className="text-md font-medium mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Articles principaux
                        </h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[100px]">Référence</TableHead>
                              <TableHead>Contenu</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedSource.articles.map((article: any) => (
                              <TableRow key={article.id}>
                                <TableCell className="font-medium">{article.title}</TableCell>
                                <TableCell>{article.content}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {selectedSource.templates && selectedSource.templates.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-md font-medium mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Modèles de documents
                        </h4>
                        <div className="space-y-2">
                          {selectedSource.templates.map((template: any) => (
                            <div key={template.id} className="border rounded-md p-3 flex justify-between items-center">
                              <div>
                                <div className="font-medium text-black">{template.title}</div>
                                <div className="text-sm text-muted-foreground">{template.description}</div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={(e) => handleDownloadClick(template.downloadUrl, e)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="text-xs text-muted-foreground mt-2 italic">
          Cette base de connaissances contient les sources juridiques marocaines utilisées pour entraîner notre modèle d'assistant juridique.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeBaseDialog;
