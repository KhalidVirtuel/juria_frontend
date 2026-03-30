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
import { ragAPI, RagFile,ragAdminAPI } from "@/lib/api";

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
  const [tab, setTab] = React.useState<"overview" | "ragData" | "ragStats">(
    "overview"
  );
  const [searchQuery, setSearchQuery] = React.useState("");

  // RAG files (onglet Rag-in)
  const [files, setFiles] = React.useState<RagFile[]>([]);
  const [loadingFiles, setLoadingFiles] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  // RAG stats (onglet Rag-stat)
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = React.useState(false);

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
      const data = await ragAPI.stats();
      setStats(data);
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

  const onDeleteFileRow = async (id: number) => {
    if (!confirm("Supprimer ce fichier et ses embeddings ?")) return;
    try {
      await ragAPI.remove(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
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
  const { ok, pid, logFile } = await ragAdminAPI.rebuild();
  if (ok) {
    // tu peux afficher pid et proposer d’ouvrir / suivre le log
    console.log('RAG rebuild lancé, PID:', pid, 'log:', logFile);
  }
};


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[980px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Base de connaissances
          </DialogTitle>

          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher…"
              className="w-full pl-9 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="flex-1 flex flex-col gap-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Catalogues</TabsTrigger>
            <TabsTrigger value="ragData">Rag-in</TabsTrigger>
            <TabsTrigger value="ragStats">
              <BarChart3 className="h-4 w-4 mr-1" />
              Rag-stat
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[420px] pr-3">
              <div className="space-y-4 py-2">
                {filteredCatalog.map((s) => (
                  <div key={s.id} className="border rounded-md p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-black">{s.title}</h3>
                        <p className="text-sm text-muted-foreground">{s.description}</p>
                      </div>
                      {s.downloadUrl && (
                        <Button variant="outline" size="sm" onClick={() => window.open(s.downloadUrl, "_blank")}>
                          <Download className="h-4 w-4 mr-1" />
                          Télécharger
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* RAG-IN */}
          <TabsContent value="ragData" className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">
                Uploadez vos documents <b>.txt</b>, <b>.pdf</b>, <b>.doc</b>, <b>.docx</b>. Ils seront indexés pour le RAG.
              </div>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={onPickFile}
                />
                <Button onClick={openPicker} disabled={uploading} className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Import…" : "Ajouter un fichier"}
                </Button>

               
              </div>
            </div>

            <ScrollArea className="h-[420px] pr-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead className="w-[120px]">Taille</TableHead>
                    <TableHead className="w-[180px]">Ajouté</TableHead>
                    <TableHead className="w-[160px]">Actions</TableHead>
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
                        <TableCell>{formatBytes(f.size)}</TableCell>
                        <TableCell>{f.createdAt ? new Date(f.createdAt).toLocaleString() : "—"}</TableCell>
                        <TableCell className="space-x-2">
                          <Button variant="outline" size="sm" onClick={() => window.open(f.url!, "_blank")}>
                            <Download className="h-4 w-4 mr-1" />
                            Ouvrir
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => onDeleteFileRow(f.id!)}>
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
                <Button onClick={openPicker} disabled={uploading} className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Import…" : "Ajouter un fichier"}
                </Button>

                 <Button onClick={onRebuild} disabled={uploading} className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Building…" : "Rebuild le RAG"}
                </Button>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
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
            </div>
            {stats && (
              <div className="mt-3 text-xs text-muted-foreground">
                Total des points indexés : <b>{stats.total}</b>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="text-xs text-muted-foreground mt-2 italic">
          Les documents RAG restent privés sur votre compte et servent uniquement à vos réponses.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeBaseDialog;
