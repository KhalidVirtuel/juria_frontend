// src/components/KnowledgeBaseDialog.tsx
import React,{useState,useEffect} from "react";
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
import {
  Search,
  FileText,
  Download,
  BookOpen,
  Trash2,
  Upload,
  BarChart3,
  Scale,
  FileSignature,
  Loader2,
} from "lucide-react";
import { ragAPI, RagFile, ragAdminAPI, catalogueAPI, searchAPI} from "@/lib/api";
import { useQuery } from '@tanstack/react-query';

import AddLegalDocumentDialog from "../Knowledge/AddLegalDocumentDialog";
import AddLegalDocumentDialogDocument from "../Knowledge/AddLegalDocumentDialogDocument";

import { toast } from "sonner";
import { Progress } from "@/components/ui/progress"; // Si disponible
/* —————————————————————————————————————————————
   Catalogue fictif (facultatif) */
const legalSources = [
  {
    id: "code-penal",
    title: "Le Code pénal marocain",
    description:
      "Ensemble des lois définissant les infractions et fixant les peines applicables",
    articles: [
      { id: "477", title: "Article 477", content: "…" },
      { id: "485", title: "Article 485", content: "…" },
      { id: "496", title: "Article 496", content: "…" },
    ],
    downloadUrl: "/documents/code-penal-maroc.pdf",
  },
];

/* —————————————————————————————————————————————
   Utils */
const formatBytes = (bytes?: number) => {
  if (!bytes || isNaN(bytes)) return "—";
  const units = ["o", "Ko", "Mo", "Go"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

type Stats = { total: number; byPath: { path: string; count: number }[] };

const KnowledgeBaseRag: React.FC = () => {
  const [tab, setTab] = useState<"searchTab" | "overview" | "ragData" | "ragStats">(
    "ragData"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryDocuments, setSearchQueryDocuments] = useState("");
    // RAG stats (onglet overview)
  const [filesDocuments, setFilesDocuments] = useState<RagFile[]>([]);
   const [filteredDocuments, setFilteredDocuments] = useState<RagFile[]>([]);
  const [loadingFilesDocuments, setLoadingFilesDocuments] = useState(false);

  // RAG files (onglet Rag-in)
  const [files, setFiles] = useState<RagFile[]>([]);
  const [filteredSources, setFilteredSources] = useState<RagFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  // RAG stats (onglet Rag-stat)
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const [activeTab, setActiveTab] = useState("ragData");


  const [legalDocDialogOpen, setLegalDocDialogOpen] = useState(false);
  const [legalDocDialogOpenOVERVIEW, setLegalDocDialogOpenOVERVIEW] = useState(false);


  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Vectorisation des lois en cours...");
// States pour documents internes
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [loadingTextDoc, setLoadingTextDoc] = useState("Vectorisation des documents en cours...");

    // Charger la liste lors de l’ouverture de l’onglet overview / Document 
  useEffect(() => {
    if (tab !== "overview") return;
    (async () => {
      try {
        setLoadingFilesDocuments(true);
        const { files } = await catalogueAPI.list();
         console.log("Documents catalogueAPI list");
        console.log(files);
        setFilesDocuments(files || []);
        setFilteredDocuments(files || []);
      } catch (e) {
        console.error("Documents list failed", e);
      } finally {
        setLoadingFilesDocuments(false);
      }
    })();
  }, [tab]);


  // Charger la liste lors de l’ouverture de l’onglet ragData
  useEffect(() => {
    if (tab !== "ragData") return;
    (async () => {
      try {
        setLoadingFiles(true);
        const { files } = await catalogueAPI.listWithMetadata();
        console.log("RAG list");
        console.log(files);
        setFiles(files || []);
        setFilteredSources(files || []);
    refreshStats();
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
    


      const dataCatalogueAPI = await catalogueAPI.stats();
      const dataRagAPI = await ragAPI.stats();

      console.log(dataRagAPI)
      console.log(dataCatalogueAPI)

     const mergedData = {
        total: dataRagAPI.total + dataCatalogueAPI.total,
        byPath: [...dataRagAPI.byPath, ...dataCatalogueAPI.byPath]
      };
 console.log("mergedData")
      console.log(mergedData)
            console.log("mergedData")
      setStats(mergedData);
    } catch (e) {
      console.error("stats failed", e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  /*useEffect(() => {
    if (tab !== "ragStats") return;
    alert("Les statistiques de la base de connaissances sont en cours de développement.");
    refreshStats();
  }, [tab, refreshStats]);*/








  useEffect(() => {
  if (!uploading) {
    setLoadingProgress(0);
    return;
  }
  
  const texts = [
    { text: "Démarrage de la vectorisation...", progress: 10 },
    { text: "Lecture des documents juridiques...", progress: 25 },
    { text: "Analyse et traitement des textes...", progress: 50 },
    { text: "Indexation dans la base vectorielle...", progress: 75 },
    { text: "Finalisation et optimisation...", progress: 90 },
  ];
  
  let index = 0;
  const interval = setInterval(() => {
    if (index < texts.length) {
      setLoadingText(texts[index].text);
      setLoadingProgress(texts[index].progress);
      index++;
    }
  }, 7500);
  
  return () => clearInterval(interval);
}, [uploading]);


// ✅ NOUVEAU : Animation texte pour documents internes
useEffect(() => {
  if (!uploadingDoc) return;
  
  const texts = [
    "Démarrage de la vectorisation...",
    "Lecture des documents internes...",
    "Analyse et traitement des fichiers...",
    "Indexation dans la base vectorielle...",
    "Finalisation et optimisation...",
  ];
  
  let index = 0;
  const interval = setInterval(() => {
    index = (index + 1) % texts.length;
    setLoadingTextDoc(texts[index]);
  }, 3000);
  
  return () => clearInterval(interval);
}, [uploadingDoc]);

  const openPicker = () => fileRef.current?.click();


const handleDownload = async (url: string, filename: string) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename; // ✅ Force le téléchargement
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (error) {
    toast.error('Impossible de télécharger le fichier');
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


  //Pickfile doc
  /*const onPickFileDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };*/




  const onPickFileDoc = async (data: { name: string; description: string; file: File }) => {
  try {
    setUploading(true);

    const { file: saved } = await catalogueAPI.upload(data.file, data.name, data.description);

    console.log("Document uploaded:", {
      name: data.name,
      description: data.description,
      file: saved,
    });
    
    toast.success(`Document "${data.name}" ajouté avec succès !`);
    
    // Rafraîchir la liste si on est sur l'onglet ragData
    if (tab === "overview") {
      setFilesDocuments((prev) => [saved, ...prev]);
      setFilteredDocuments((prev) => [saved, ...prev]);
    }
    
    // Rafraîchir les stats
    await refreshStats();
  } catch (error) {
    console.error("Upload failed", error);
    toast.error("Erreur lors de l'ajout du document");
    throw error; // Important pour que le Dialog sache qu'il y a eu une erreur
  } finally {
    setUploading(false);
  }
};



const handleAddLegalDocument = async (data: { name: string; description: string; file: File }) => {
  try {
    setUploading(true);
    
    // Upload le fichier via ragAPI (pas catalogueAPI)
    //const { file: saved } = await ragAPI.upload(data.file);
    const { file: saved } = await catalogueAPI.uploadWithMetadata(data.file, data.name, data.description);
    // TODO: Enregistre aussi le nom et la description dans une base de données
    // Pour l'instant, on stocke juste le fichier
    console.log("Document uploaded:", {
      name: data.name,
      description: data.description,
      file: saved,
    });
    
    toast.success(`Document "${data.name}" ajouté avec succès !`);
    
    // Rafraîchir la liste si on est sur l'onglet ragData
    if (tab === "ragData") {
      setFiles((prev) => [saved, ...prev]);
      setFilteredSources((prev) => [saved, ...prev]);
    }
    
    // Rafraîchir les stats
    await refreshStats();
  } catch (error) {
    console.error("Upload failed", error);
    toast.error("Erreur lors de l'ajout du document");
    throw error; // Important pour que le Dialog sache qu'il y a eu une erreur
  } finally {
    setUploading(false);
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
      //await ragAPI.remove(name);
       await catalogueAPI.remove(name);
      setFiles((prev) => prev.filter((f) => f.name !== name));
      setFilteredSources((prev) => prev.filter((f) => f.name !== name));

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
      await catalogueAPI.removecatalogue(name);
      setFilesDocuments((prev) => prev.filter((f) => f.name !== name));
      setFilteredDocuments((prev) => prev.filter((f) => f.name !== name));
      // rafraîchir stats si l’onglet est ouvert
      if (tab === "ragStats") {
        await refreshStats();
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert("Échec de la suppression.");
    }
  };



/*
const onRebuildDocument = async () => {
  try {
    setUploading(true); // ✅ Ajoute ceci
    const { ok, pid, logFile } = await catalogueAPI.rebuildDoc();
    if (ok) {
      console.log('RAG rebuild lancé catalogueAPI, PID:', pid, 'log:', logFile);
      // Optionnel : rafraîchir les stats après un délai
      setTimeout(refreshStats, 3000);
    }
       // alert('Rebuild RAG documents lancé avec succès');

  } catch (err) {
    console.error('Rebuild failed', err);
    alert('Échec du rebuild RAG');
  } finally {
    setUploading(false); // ✅ Ajoute ceci
  }
};*/
const onRebuildDocument = async () => {
  try {
    setUploadingDoc(true); // ✅ Utiliser uploadingDoc au lieu de uploading
    
    // 1️⃣ Lancer la vectorisation des documents
    const { ok, pid } = await catalogueAPI.rebuildDoc();
    
    if (!ok) {
      throw new Error('Échec du lancement de la vectorisation');
    }
    
    console.log('✅ Vectorisation documents lancée, PID:', pid);
    toast.info('⏳ Vectorisation des documents internes en cours...', {
      description: 'Veuillez patienter pendant le traitement.',
    });
    
    // 2️⃣ Démarrer le polling pour vérifier le statut
    const pollInterval = setInterval(async () => {
      try {
        const status = await catalogueAPI.getStatusDocument(); // ✅ Nouvelle fonction
        
        console.log('📊 Statut vectorisation documents:', status);
        
        // 3️⃣ Si la vectorisation est terminée
        if (!status.isRunning && status.lastRun?.endedAt) {
          clearInterval(pollInterval);
          setUploadingDoc(false);
          
          // 4️⃣ Vérifier le succès
          if (status.lastRun.success) {
            toast.success('✅ Documents internes vectorisés avec succès !', {
              description: 'La base de connaissances est maintenant à jour.',
              duration: 5000,
            });
            
            // Rafraîchir les stats après 1 seconde
            setTimeout(refreshStats, 1000);
          } else {
            toast.error('❌ Échec de la vectorisation', {
              description: 'Une erreur est survenue lors du traitement.',
              duration: 5000,
            });
          }
        }
      } catch (pollError) {
        console.error('Erreur polling documents:', pollError);
        clearInterval(pollInterval);
        setUploadingDoc(false);
        toast.error('❌ Erreur lors de la vérification du statut');
      }
    }, 3000); // Vérifier toutes les 3 secondes
    
    // 5️⃣ Timeout de sécurité (5 minutes max)
    setTimeout(() => {
      clearInterval(pollInterval);
      if (uploadingDoc) {
        setUploadingDoc(false);
        toast.warning('⏱️ Timeout : La vectorisation prend trop de temps', {
          description: 'Vérifiez les logs pour plus de détails.',
        });
      }
    }, 300000); // 5 minutes
    
  } catch (err) {
    console.error('❌ Rebuild documents failed:', err);
    setUploadingDoc(false);
    toast.error('❌ Échec du rebuild documents', {
      description: err instanceof Error ? err.message : 'Erreur inconnue',
    });
  }
};

/*
const onRebuildCatalogue = async () => {
  try {
    setUploading(true); // ✅ Ajoute ceci
    const { ok, pid, logFile } = await catalogueAPI.rebuildCat();
    if (ok) {
      console.log('catalogueAPI RAG rebuild lancé, PID:', pid, 'log:', logFile);
      setTimeout(refreshStats, 3000);
    }
    alert('Rebuild RAG Sources Juridiques lancé avec succès');
  } catch (err) {
    console.error('Rebuild catalogue failed', err);
    alert('Échec du rebuild catalogue');
  } finally {
    setUploading(false); // ✅ Ajoute ceci
  }
};
*/

const onRebuildCatalogue = async () => {
  try {
    setUploading(true);
    
    // 1️⃣ Lancer la vectorisation
    const { ok, pid } = await catalogueAPI.rebuildCat();
    
    if (!ok) {
      throw new Error('Échec du lancement de la vectorisation');
    }
    
    console.log('✅ Vectorisation lancée, PID:', pid);
    toast.info('⏳ Vectorisation en cours...', {
      description: 'Veuillez patienter pendant le traitement des documents.',
    });
    
    // 2️⃣ Démarrer le polling pour vérifier le statut
    const pollInterval = setInterval(async () => {
      try {
        const status = await catalogueAPI.getStatus(); // ✅ Utiliser getStatus
        
        console.log('📊 Statut vectorisation:', status);
        
        // 3️⃣ Si la vectorisation est terminée
        if (!status.isRunning && status.lastRun?.endedAt) {
          clearInterval(pollInterval);
          setUploading(false);
          
          // 4️⃣ Vérifier le succès
          if (status.lastRun.success) {
            toast.success('✅ Documents vectorisés avec succès !', {
              description: 'Le catalogue juridique est maintenant à jour.',
              duration: 5000,
            });
            
            // Rafraîchir les stats après 1 seconde
            setTimeout(refreshStats, 1000);
          } else {
            toast.error('❌ Échec de la vectorisation', {
              description: 'Une erreur est survenue lors du traitement.',
              duration: 5000,
            });
          }
        }
      } catch (pollError) {
        console.error('Erreur polling:', pollError);
        clearInterval(pollInterval);
        setUploading(false);
        toast.error('❌ Erreur lors de la vérification du statut');
      }
    }, 3000); // Vérifier toutes les 3 secondes
    
    // 5️⃣ Timeout de sécurité (5 minutes max)
    setTimeout(() => {
      clearInterval(pollInterval);
      if (uploading) {
        setUploading(false);
        toast.warning('⏱️ Timeout : La vectorisation prend trop de temps', {
          description: 'Vérifiez les logs pour plus de détails.',
        });
      }
    }, 300000); // 5 minutes
    
  } catch (err) {
    console.error('❌ Rebuild catalogue failed:', err);
    setUploading(false);
    toast.error('❌ Échec du rebuild catalogue', {
      description: err instanceof Error ? err.message : 'Erreur inconnue',
    });
  }
};
const onRebuildCatalogueStat = async () => {
  try {
    setUploading(true);
      const { ok, pid, type } = await catalogueAPI.rebuildCatStat();
    if (ok) {
      console.log('catalogueAPI state:', {ok, pid, type});
      setTimeout(refreshStats, 3000);
    }
    //alert('catalogueAPI state:');
  } catch (err) {
    console.error('Rebuild catalogue state failed', err);
    alert('Échec du rebuild catalogue state');
  } finally {
    setUploading(false); 
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



  const [q, setQ] = useState('');
  const [mode, setMode] = useState<'phrase' | 'all' | 'any'>('phrase');
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
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}


  /*const filesLois = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return files;
    return files.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);*/

  
  useEffect(() => {
    const query = searchQueryDocuments.toLowerCase();
    setFilteredDocuments(filesDocuments.filter(source => 
      source.name.toLowerCase().includes(query) || 
      source.description.toLowerCase().includes(query)
    ));
  }, [searchQueryDocuments]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredSources(files.filter(source => 
      source.name.toLowerCase().includes(query) || 
      source.description.toLowerCase().includes(query)
    ));
  }, [searchQuery]);
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



    
 

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="flex-1 flex flex-col gap-3">
          <TabsList className="grid w-full grid-cols-3">
           
             <TabsTrigger value="ragData"> <Scale className="h-4 w-4 mr-1" /> Sources Juridiques</TabsTrigger>
             <TabsTrigger value="overview"> <FileSignature className="h-4 w-4 mr-1" />Modèles de Documents</TabsTrigger>
             <TabsTrigger value="searchTab"><Search className="h-4 w-4 mr-1" /> Recherche</TabsTrigger>
           {/*  <TabsTrigger value="ragStats"><BarChart3 className="h-4 w-4 mr-1" />Data-stats</TabsTrigger>*/}

          </TabsList>
                 {/* Search */}
                <div className="relative mb-1">
                    {tab === "searchTab" ? (
                        <div className="flex items-center justify-start mb-2 relative mt-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                            type="search"
                            placeholder="Rechercher des codes, articles, ou sujets juridiques..."
                            className="w-full max-w-lg pl-10 mr-2"
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            />
                            <select value={mode} onChange={e => setMode(e.target.value as any)}  className="w-full max-w-lg p-3 mr-2 rounded-xl select border border-mezin bg-background text-foreground hover:border-foreground">
                            <option value="phrase">Phrase exacte</option>
                            <option value="all">Tous les mots</option>
                            <option value="any">Au moins un mot</option>
                            </select>
                        </div>       
                    ) : (
                      <>
                       {tab === "overview" ? (
                        <>
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Rechercher un modèle de document ou contrat..."
                            className="w-full max-w-lg pl-10"
                            value={searchQueryDocuments}
                            onChange={(e) => setSearchQueryDocuments(e.target.value)}
                        />
                        </>
                          ): (
                            <>
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="search"
                                  placeholder="Rechercher dans les codes et articles juridiques..." 
                                  className="w-full max-w-lg pl-10"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </>
                          )}
                        </>
                    )}
                 
                </div>
          {/* Recherche */}
          <TabsContent value="searchTab" className="flex-1 overflow-hidden">
                     

            <ScrollArea className="h-[320px] pr-3">
              <Table>
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
                          <TableRow key={element.filename}>
                            <TableCell colSpan={4} > 
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
            <div className="flex items-center justify-between mb-2 mx-4">
              <div className="text-sm text-muted-foreground">
                Uploadez vos documents <b>.txt</b>, <b>.pdf</b>, <b>.doc</b>, <b>.docx</b>.
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => setLegalDocDialogOpenOVERVIEW(true)} disabled={uploading} className="flex items-center gap-2 border border-blue-950 bg-white text-blue-950 hover:text-white hover:bg-mezin" >
                  <Upload className="h-4 w-4" />
                  {uploading ? "Ajouter un document" : "Ajouter un document"}
                </Button>
               <Button 
                  onClick={onRebuildDocument} 
                  disabled={uploadingDoc} 
                  className="flex items-center gap-2 border border-blue-950 bg-white text-blue-950 hover:text-white hover:bg-mezin disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {uploadingDoc ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="animate-pulse">{loadingTextDoc}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Vectoriser - Documents interne -</span>
                    </>
                  )}
                </Button>

               
              </div>
            </div>

            <ScrollArea className="h-[320px] pr-3">
                <div className="space-y-1">
                  {loadingFilesDocuments ? (
                    <div>
                      Chargement…
                    </div>
                      ) : filteredDocuments.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        Aucune source trouvée pour "{searchQueryDocuments}"
                    </div>           
                      ) : (
                    filteredDocuments.map((f) => (
                     <div 
                      key={f.path} 
                      className="flex items-center justify-between py-3 px-4 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors group border border-transparent hover:border-border/50"
                      >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                          <Scale className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-foreground truncate">{f.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{f.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                          {formatBytes(f.size)}
                        </span>


                      <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDownload(f.url!, f.name ?? f.path)}
                          title="Télécharger"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                          <Button   
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity  hover:bg-red-600" 
                          onClick={() => onDeleteFileRow(f.path)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                      </div>                      
                    </div>
                    ))
                  )}
                </div>
            </ScrollArea>
          </TabsContent>

          {/* RAG-IN */}
          <TabsContent value="ragData" className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-2 mx-4">
              <div className="text-sm text-muted-foreground">
                Uploadez vos documents <b>.txt</b>, <b>.pdf</b>, <b>.doc</b>, <b>.docx</b>.
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => setLegalDocDialogOpen(true)} disabled={uploading} className="flex items-center gap-2 border border-blue-950 bg-white text-blue-950 hover:text-white hover:bg-mezin" >
                  <Upload className="h-4 w-4" />
                  {uploading ? "Ajouter un document de lois" : "Ajouter un document de lois"}
                </Button>
                
                 <div className="space-y-2">
                  <Button 
                    onClick={onRebuildCatalogue} 
                    disabled={uploading} 
                    className="w-full flex items-center justify-center gap-2 border border-blue-950 bg-white text-blue-950 hover:text-white hover:bg-mezin disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="font-medium">{loadingText}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span className="font-medium">Vectoriser - Dictionnaire de lois -</span>
                      </>
                    )}
                  </Button>
                  
                  {/* Barre de progression (visible uniquement pendant upload) */}
                  {uploading && (
                    <div className="w-full space-y-1">
                      <Progress value={loadingProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">
                        {loadingProgress}% complété
                      </p>
                    </div>
                  )}
                </div>

               {/* <Button onClick={onRebuildCatalogueStat} disabled={uploading} className="flex items-center gap-2 border border-blue-950 bg-white text-blue-950 hover:text-white hover:bg-mezin">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Building…" : "Rebuild le RAG  - State -"}
                </Button>
               */}
              </div>
            </div>
              <ScrollArea className="h-[320px] pr-3">
                <div className="space-y-1">
                  {loadingFiles ? (
                    <div>
                      Chargement…
                    </div>
                      ) : filteredSources.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        Aucune source trouvée pour "{searchQuery}"
                    </div>           
                      ) : (
                    filteredSources.map((f) => (
                    <div 
                      key={f.path} 
                      className="flex items-center justify-between py-3 px-4 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors group border border-transparent hover:border-border/50"
                      >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                          <Scale className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-foreground truncate">{f.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{f.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                          {formatBytes(f.size)}
                        </span>


                      <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                           onClick={(e) => handleDownload(f.url!, f.name ?? f.path)}
                          title="Télécharger"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                          <Button   
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity  hover:bg-red-600" 
                          onClick={() => onDeleteFileRowDocument(f.path)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                      </div>                      
                    </div>
                    ))
                  )}
                </div>
              </ScrollArea>
          </TabsContent>

          {/* RAG-STATS 
          <TabsContent value="ragStats" className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">
                Statistiques d’indexation — total de chunks et top fichiers.
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
           
          </TabsContent>*/}
        </Tabs>

              {stats && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Total des points indexés : <b>{stats.total}</b>
                </div>
                )}
        <div className="text-xs text-muted-foreground  italic">
          Les documents RAG restent privés sur votre compte et servent uniquement à vos réponses.
        </div>


        <AddLegalDocumentDialog
          open={legalDocDialogOpen}
          onOpenChange={setLegalDocDialogOpen}
          onSubmit={handleAddLegalDocument}
          uploading={uploading}
        />

         <AddLegalDocumentDialogDocument
          open={legalDocDialogOpenOVERVIEW}
          onOpenChange={setLegalDocDialogOpenOVERVIEW}
          onSubmit={onPickFileDoc}
          uploading={uploading}
        />


    </div>
  );
};

export default KnowledgeBaseRag;
