// src/components/KnowledgeBaseDialog.tsx
import React,{useState}from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {   Trash2, Upload, BarChart3, Search, FileText, Download, BookOpen, ArrowLeft, Scale, FileSignature, Briefcase, Home, Users, Building, Gavel, ScrollText, FileCheck } from "lucide-react";
import { toast } from "sonner";

import { ragAPI, RagFile, ragAdminAPI, catalogueAPI, searchAPI} from "@/lib/api";
import { useQuery } from '@tanstack/react-query';
/* —————————————————————————————————————————————

/* —————————————————————————————————————————————
   Utils */
const formatBytes = (bytes?: number) => {
  if (!bytes || isNaN(bytes)) return "—";
  const units = ["o", "Ko", "Mo", "Go"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

type Stats = { total: number; byPath: { path: string; count: number }[] };


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

const KnowledgeBaseDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) => {
  const [tab, setTab] = React.useState<"searchTab" | "overview" | "ragData" | "ragStats">(
    "searchTab"
  );
  const [searchQuery, setSearchQuery] = React.useState("");

    // RAG stats (onglet overview)
  const [filesDocuments, setFilesDocuments] = React.useState<RagFile[]>([]);
  const [loadingFilesDocuments, setLoadingFilesDocuments] = React.useState(false);

  // RAG files (onglet Rag-in)
  const [files, setFiles] = React.useState<RagFile[]>([]);
  const [loadingFiles, setLoadingFiles] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  // RAG stats (onglet Rag-stat)
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = React.useState(false);


    const [activeTab, setActiveTab] = useState("sources");
    const [filteredSources, setFilteredSources] = useState(legalSources);
    const [filteredTemplates, setFilteredTemplates] = useState(documentTemplates);
    const [selectedSource, setSelectedSource] = useState<typeof legalSources[0] | null>(null);

    // Charger la liste lors de l’ouverture de l’onglet overview / Document 
  React.useEffect(() => {
    if (tab !== "overview") return;
    (async () => {
      try {
        setLoadingFilesDocuments(true);
        const { files } = await catalogueAPI.list();
        setFilesDocuments(files || []);
      } catch (e) {
        console.error("Documents list failed", e);
      } finally {
        setLoadingFilesDocuments(false);
      }
    })();
  }, [tab]);


  // Charger la liste lors de l’ouverture de l’onglet ragData
  React.useEffect(() => {
    if (tab !== "ragData") return;
    (async () => {
      try {
        setLoadingFiles(true);
        const { files } = await ragAPI.list();
        setFiles(files || []);
      } catch (e) {
        console.error("RAG list failed", e);
      } finally {
        setLoadingFiles(false);
      }
    })();
  }, [tab]);

  // Charger les stats
  const refreshStats = React.useCallback(async () => {
    try {
      setLoadingStats(true);
      const dataRagAPI = await ragAPI.stats();
      const dataCatalogueAPI = await catalogueAPI.stats();
     console.log(dataRagAPI)
     console.log(dataCatalogueAPI)

     const mergedData = {
        total: dataRagAPI.total + dataCatalogueAPI.total,
        byPath: [...dataRagAPI.byPath, ...dataCatalogueAPI.byPath]
      };

      console.log(mergedData)
      setStats(mergedData);
    } catch (e) {
      console.error("stats failed", e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  React.useEffect(() => {
    if (tab !== "ragStats") return;
    refreshStats();
  }, [tab, refreshStats]);

  const openPicker = () => fileRef.current?.click();


  //Pickfile doc
  const onPickFileDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const { file: saved } = await catalogueAPI.upload(file);
      // si on est sur Rag-in, maj la liste locale
      if (saved && tab === "overview") setFilesDocuments((prev) => [saved, ...prev]);
      // toujours rafraîchir les stats
      await refreshStats();
    } catch (err) {
      console.error("Upload failed", err);
      alert("Échec de l’upload / catalogue.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  //Pickfile RAG
  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const { file: saved } = await ragAPI.upload(file);
      // si on est sur Rag-in, maj la liste locale
      if (saved && tab === "ragData") setFiles((prev) => [saved, ...prev]);
      // toujours rafraîchir les stats
      await refreshStats();
    } catch (err) {
      console.error("Upload failed", err);
      alert("Échec de l’upload / ingestion.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const onDeleteByPath = async (path: string) => {
    if (!confirm("Supprimer tous les embeddings pour ce document ?")) return;
    try {
      await ragAPI.deleteByPath(path);
      await refreshStats();
    } catch (err) {
      console.error("Delete by path failed", err);
      alert("Échec de la suppression.");
    }
  };

  const onDeleteFileRow = async (name: string) => {
    if (!confirm("Supprimer ce fichier et ses embeddings ?")) return;
    try {
      await ragAPI.remove(name);
      setFiles((prev) => prev.filter((f) => f.name !== name));
      // rafraîchir stats si l’onglet est ouvert
      if (tab === "ragStats") {
        await refreshStats();
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert("Échec de la suppression.");
    }
  };

  const onDeleteFileRowDocument = async (name: string) => {
    if (!confirm("Supprimer ce fichier et ses embeddings ?")) return;
    try {
      await catalogueAPI.remove(name);
      setFilesDocuments((prev) => prev.filter((f) => f.name !== name));
      // rafraîchir stats si l’onglet est ouvert
      if (tab === "ragStats") {
        await refreshStats();
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert("Échec de la suppression.");
    }
  };

  const filteredCatalog = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return legalSources;
    return legalSources.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);



const onRebuild = async () => {
  try {
    setUploading(true); // ✅ Ajoute ceci
    const { ok, pid, logFile } = await ragAPI.rebuild();
    if (ok) {
      console.log('RAG rebuild lancé, PID:', pid, 'log:', logFile);
      // Optionnel : rafraîchir les stats après un délai
      setTimeout(refreshStats, 3000);
    }
  } catch (err) {
    console.error('Rebuild failed', err);
    alert('Échec du rebuild RAG');
  } finally {
    setUploading(false); // ✅ Ajoute ceci
  }
};

const onRebuildCatalogue = async () => {
  try {
    setUploading(true); // ✅ Ajoute ceci
    const { ok, pid, logFile } = await catalogueAPI.rebuild();
    if (ok) {
      console.log('catalogueAPI RAG rebuild lancé, PID:', pid, 'log:', logFile);
      setTimeout(refreshStats, 3000);
    }
  } catch (err) {
    console.error('Rebuild catalogue failed', err);
    alert('Échec du rebuild catalogue');
  } finally {
    setUploading(false); // ✅ Ajoute ceci
  }
};

const onRebuildAll = async () => {
  try {
    setUploading(true); // ✅ Ajoute ceci
    const { ok, pid, logFile } = await ragAPI.rebuild();
    if (ok) {
      console.log('RAG rebuild lancé, PID:', pid, 'log:', logFile);
    }
    console.log('pas encors.....');
    setTimeout(refreshStats, 3000);
  } catch (err) {
    console.error('Rebuild all failed', err);
    alert('Échec du rebuild total');
  } finally {
    setUploading(false); // ✅ Ajoute ceci
  }
};



  const [q, setQ] = React.useState('');
  const [mode, setMode] = React.useState<'phrase' | 'all' | 'any'>('phrase');
  const dq = useDebounced(q, 350);

  const { data, isFetching } = useQuery({
    queryKey: ['search-content', dq, mode],
    queryFn: () => searchAPI.searchFiles(dq, mode),
    enabled: dq.trim().length > 0,
    staleTime: 30_000,
  });

  const filesSearch = data?.results ?? [];
console.log("filesSearch")
console.log(filesSearch)
  function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}



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

    <>
    

 <div className="h-full flex flex-col p-6 bg-background">
      {/* Header */}
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Base de connaissances juridiques
        </h1>
        <p className="text-muted-foreground">Sources juridiques marocaines et modèles de documents</p>
      </div>
  </div>

  {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
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








    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[980px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Base de connaissances
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="flex-1 flex flex-col gap-3">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="searchTab">Recherche</TabsTrigger>
            <TabsTrigger value="overview">Documents Internes</TabsTrigger>
            <TabsTrigger value="ragData">Dictionnaire de lios</TabsTrigger>
            <TabsTrigger value="ragStats">
              <BarChart3 className="h-4 w-4 mr-1" />
              Data-stats
            </TabsTrigger>
          </TabsList>


           {/* Search */}
          <TabsContent value="searchTab" className="flex-1 overflow-hidden">
              <div className="flex items-center justify-around mb-2 relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher des codes, articles, ou sujets juridiques..."
                  className="w-[460px] pl-9 pr-4"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                />
                 <select value={mode} onChange={e => setMode(e.target.value as any)}  className="w-[460px] pl-9 pr-4 select">
                  <option value="phrase">Phrase exacte</option>
                  <option value="all">Tous les mots</option>
                  <option value="any">Au moins un mot</option>
                </select>
              </div>              

            <ScrollArea className="h-[320px] pr-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead className="text-center w-[120px]">Taille</TableHead>
                    <TableHead className="w-[240px] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isFetching ? (
                    <TableRow>
                      <TableCell colSpan={4}>Chargement…</TableCell>
                    </TableRow>
                  ) : filesSearch.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>Aucun fichier ne contient cette suite de mots..</TableCell>
                    </TableRow>
                  ) : (
                        filesSearch.map((element) => (
                          <TableRow>
                            <TableCell colSpan={4} key={element.filename}> 
                              <a className="underline" href={element.filename} target="_blank" rel="noreferrer">
                              {element.filename}
                              </a>
                              <hr/>
                              <span className="text-md text-muted-foreground  italic">"... {element.snippets[0]} ..."</span>
                            </TableCell> 
                          </TableRow>
                        ))
                     )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">
                Uploadez vos documents <b>.txt</b>, <b>.pdf</b>, <b>.doc</b>, <b>.docx</b>.
              </div>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={onPickFileDoc}
                />
                <Button onClick={openPicker} disabled={uploading} className="flex items-center gap-2 border border-blue-950 bg-white text-blue-950 hover:text-white hover:bg-mezin">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Import…" : "Ajouter un document interne"}
                </Button>
                <Button onClick={onRebuildCatalogue} disabled={uploading} className="flex items-center gap-2 border border-blue-950 bg-white text-blue-950 hover:text-white hover:bg-mezin">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Building…" : "Rebuild le RAG - Documents interne -"}
                </Button>
               
              </div>
            </div>

            <ScrollArea className="h-[320px] pr-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead className="text-center w-[120px]">Taille</TableHead>
                    <TableHead className="w-[240px] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingFilesDocuments ? (
                    <TableRow>
                      <TableCell colSpan={4}>Chargement…</TableCell>
                    </TableRow>
                  ) : filesDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>Aucun fichier.</TableCell>
                    </TableRow>
                  ) : (
                    filesDocuments.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium ">
                          <a className="underline" href={f.url} target="_blank" rel="noreferrer">
                            {f.name}
                          </a>
                        </TableCell>
                        <TableCell className=" text-center w-[120px]">{formatBytes(f.size)}</TableCell>
                        <TableCell className="space-x-2 text-center w-[240px]">
                          <Button variant="outline" size="sm" onClick={() => window.open(f.url!, "_blank")}>
                            <Download className="h-4 w-4 mr-1" />
                            Ouvrir
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => onDeleteFileRowDocument(f.name!)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          {/* RAG-IN */}
          <TabsContent value="ragData" className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">
                Uploadez vos documents <b>.txt</b>, <b>.pdf</b>, <b>.doc</b>, <b>.docx</b>.
              </div>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={onPickFile}
                />
                <Button onClick={openPicker} disabled={uploading} className="flex items-center gap-2 border border-blue-950 bg-white text-blue-950 hover:text-white hover:bg-mezin">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Import…" : "Ajouter un document de lios"}
                </Button>
                <Button onClick={onRebuild} disabled={uploading} className="flex items-center gap-2 border border-blue-950 bg-white text-blue-950 hover:text-white hover:bg-mezin">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Building…" : "Rebuild le RAG  - Dictionaire de lois-"}
                </Button>
               
              </div>
            </div>

            <ScrollArea className="h-[320px] pr-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead className="text-center w-[120px]">Taille</TableHead>
                    <TableHead className="w-[240px] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingFiles ? (
                    <TableRow>
                      <TableCell colSpan={4}>Chargement…</TableCell>
                    </TableRow>
                  ) : files.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>Aucun fichier.</TableCell>
                    </TableRow>
                  ) : (
                    files.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">
                          <a className="underline" href={f.url} target="_blank" rel="noreferrer">
                            {f.name}
                          </a>
                        </TableCell>
                        <TableCell className="w-[120px] text-center">{formatBytes(f.size)}</TableCell>
                        <TableCell className="w-[240px] text-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => window.open(f.url!, "_blank")}>
                            <Download className="h-4 w-4 mr-1" />
                            Ouvrir
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => onDeleteFileRow(f.name!)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          {/* RAG-STATS */}
          <TabsContent value="ragStats" className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">
                Statistiques d’indexation — total de chunks et top fichiers.
              </div>
              <div className="flex items-center gap-2">
                {/* même input caché pour réutiliser l’upload depuis cet onglet */}
                <Input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={onPickFile}
                />
                <Button onClick={openPicker} disabled={uploading} className="flex items-center gap-2 border border-blue-950 bg-white text-blue-950 hover:text-white hover:bg-mezin">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Import…" : "Ajouter un fichier"}
                </Button>

                 <Button onClick={onRebuildAll} disabled={uploading} className="flex items-center gap-2 border border-blue-950 bg-white text-blue-950 hover:text-white hover:bg-mezin">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Building…" : "Rebuild le RAG Total"}
                </Button>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <ScrollArea className="h-[320px] pr-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fichier (path)</TableHead>
                    <TableHead className="text-right w-[120px]"># chunks</TableHead>
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingStats ? (
                    <TableRow>
                      <TableCell colSpan={3}>Chargement…</TableCell>
                    </TableRow>
                  ) : !stats || stats.byPath.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>Aucune donnée.</TableCell>
                    </TableRow>
                  ) : (
                    stats.byPath.map((row) => (
                      <TableRow key={row.path}>
                        <TableCell className="font-medium break-all">{row.path}</TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => onDeleteByPath(row.path)}
                            title="Supprimer tous les chunks de ce fichier"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
               
              </ScrollArea>
            </div>
           
          </TabsContent>
        </Tabs>

              {stats && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Total des points indexés : <b>{stats.total}</b>
                </div>
                )}
        <div className="text-xs text-muted-foreground  italic">
          Les documents RAG restent privés sur votre compte et servent uniquement à vos réponses.
        </div>
      </DialogContent>
    </Dialog>
      </>);
};

export default KnowledgeBaseDialog;
