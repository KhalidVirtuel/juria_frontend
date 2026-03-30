import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, FileText, Download, BookOpen, ArrowLeft, Scale, FileSignature, 
  Briefcase, Home, Users, Building, Gavel, ScrollText, FileCheck, Upload, Trash2 
} from "lucide-react";
import { toast } from "sonner";
import { ragAPI, catalogueAPI, RagFile,searchAPI } from "@/lib/api";
import { useQuery } from '@tanstack/react-query';

// ✅ Sources Juridiques (Dictionnaire de lois)
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
      { id: "fam-1", title: "Article 1", content: "Le présent code est dénommé Code de la Famille..." },
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

const formatBytes = (bytes?: number) => {
  if (!bytes || isNaN(bytes)) return "—";
  const units = ["o", "Ko", "Mo", "Go"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

const KnowledgeBaseSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("sources");
  const [selectedSource, setSelectedSource] = useState<typeof legalSources[0] | null>(null);
  
  // ✅ Documents Internes (RAG)
  const [internalDocuments, setInternalDocuments] = useState<RagFile[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  // ✅ Charger les documents au montage et quand on change d'onglet
  useEffect(() => {
    if (activeTab === "documents") {
      loadInternalDocuments();
    }
  }, [activeTab]);

  const loadInternalDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const { files } = await catalogueAPI.list();
      setInternalDocuments(files || []);
    } catch (error) {
      console.error("Failed to load documents", error);
      toast.error("Erreur lors du chargement des documents");
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await ragAPI.upload(file);
      toast.success(`Fichier "${file.name}" uploadé avec succès`);
      loadInternalDocuments();
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Supprimer "${filename}" ?`)) return;

    try {
      await ragAPI.remove(filename);
      toast.success("Document supprimé");
      loadInternalDocuments();
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleDownloadDocument = (doc: RagFile) => {
    window.open(`/api/rag/download/${doc.name}`, '_blank');
  };

  const handleDownloadSource = (url: string, title: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    toast.success(`Téléchargement de "${title}" en cours...`);
    window.open(url, '_blank');
  };

  // Filtrer les sources juridiques
  const filteredSources = legalSources.filter(source =>
    source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.articles.some(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Filtrer les documents internes
  const filteredDocuments = internalDocuments.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.path?.toLowerCase().includes(searchQuery.toLowerCase())
  );




    const [q, setQ] = React.useState('');
    const [mode, setMode] = React.useState<'phrase' | 'all' | 'any'>('phrase');
    const dq = useDebounced(q, 350);
  
    const { data, isFetching } = useQuery({
      queryKey: ['search-content', dq, mode],
      queryFn: () => searchAPI.searchFiles(dq, mode),
      enabled: dq.trim().length > 0,
      staleTime: 30_000,
    });
  console.log({ data, isFetching })
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
  

  return (
    <div className="h-full flex flex-col p-6 bg-background">
      {/* Header */}
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Base de connaissances juridiques
        </h1>
        <p className="text-muted-foreground">Sources juridiques marocaines et documents internes</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-4">
          <TabsTrigger value="recherche" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Recherche
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Sources Juridiques
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents Internes
          </TabsTrigger>
        </TabsList>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={activeTab === "sources" ? "Rechercher dans les codes juridiques..." : "Rechercher dans les documents internes..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          
        </div>

        {/* ONGLET 0 : recherches (RAG) */}
        <TabsContent value="recherche" className="flex-1 overflow-hidden m-0">
          <div className="h-full flex flex-col">
            {/* Documents Table */}
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
          </div>
        </TabsContent>

        {/* ONGLET 1 : Sources Juridiques */}
        <TabsContent value="sources" className="flex-1 overflow-hidden m-0">
          {selectedSource ? (
            // Vue détaillée d'un code
            <div className="h-full flex flex-col">
              <div className="mb-4">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedSource(null)}
                  className="mb-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour aux sources
                </Button>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <selectedSource.icon className="h-6 w-6" />
                  {selectedSource.title}
                </h2>
                <p className="text-muted-foreground mt-1">{selectedSource.description}</p>
                <Button
                  onClick={(e) => handleDownloadSource(selectedSource.downloadUrl, selectedSource.title, e)}
                  className="mt-3"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le code complet
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  {selectedSource.articles.map((article) => (
                    <div
                      key={article.id}
                      className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <h3 className="font-semibold mb-2">{article.title}</h3>
                      <p className="text-sm text-muted-foreground">{article.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            // Grille des sources
            <ScrollArea className="flex-1">
              <div className="grid gap-4 md:grid-cols-2 pr-4">
                {filteredSources.map((source) => (
                  <div
                    key={source.id}
                    onClick={() => setSelectedSource(source)}
                    className="group p-6 rounded-lg border border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <source.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                          {source.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {source.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{source.articles.length} articles</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* ONGLET 2 : Documents Internes (RAG) */}
        <TabsContent value="documents" className="flex-1 overflow-hidden m-0">
          <div className="h-full flex flex-col">
            {/* Upload Section */}
            <div className="mb-4">
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={handleUpload}
                accept=".pdf,.doc,.docx,.txt"
              />
              <Button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full md:w-auto"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Upload en cours..." : "Uploader un document"}
              </Button>
            </div>

            {/* Documents Table */}
            <ScrollArea className="flex-1">
              {loadingDocuments ? (
                <div className="text-center py-12 text-muted-foreground">
                  Chargement des documents...
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery ? "Aucun document trouvé" : "Aucun document interne. Uploadez vos premiers documents."}
                </div>
              ) : (
                <div className="pr-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom du fichier</TableHead>
                        <TableHead>Chemin</TableHead>
                        <TableHead>Taille</TableHead>
                        <TableHead>Chunks</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((doc) => (
                        <TableRow key={doc.name}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              {doc.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {doc.path || "—"}
                          </TableCell>
                          <TableCell>{formatBytes(doc.size)}</TableCell>
                          <TableCell>{doc.count || 0}</TableCell>
                          <TableCell className="text-sm">
                            {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('fr-FR') : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadDocument(doc)}
                                title="Télécharger"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(doc.name)}
                                className="text-destructive hover:text-destructive"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KnowledgeBaseSection;