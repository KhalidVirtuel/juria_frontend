// src/components/KnowledgeBaseDialog.tsx
import React from "react";
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
import {
  Search,
  FileText,
  Download,
  BookOpen,
  Trash2,
  Upload,
  BarChart3,
} from "lucide-react";
import { ragAPI, RagFile, ragAdminAPI, catalogueAPI, searchAPI} from "@/lib/api";
import { useQuery } from '@tanstack/react-query';
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



  return (
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
  );
};

export default KnowledgeBaseDialog;
