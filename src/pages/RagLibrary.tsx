import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ragAPI, RagFile } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

const basename = (p: string) => p?.split(/[\\/]/).pop() ?? p ?? '';

export default function RagLibrary() {
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery<RagFile[]>({
    queryKey: ['rag-files'],
    queryFn: async () => {
      const r = await ragAPI.list();   // <-- aligné
      return r.files ?? [];
    },
    staleTime: 30_000,
  });

  const [q, setQ] = React.useState('');
  const files = (data ?? [])
    .filter(f => basename(f.path).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0)); // count est dans RagFile

  const del = useMutation({
    mutationFn: (path: string) => ragAPI.deleteByPath(path),
    onSuccess: ({ deleted }) => {
      toast({ title: 'Supprimé', description: `${deleted} chunk(s) supprimé(s).` });
      qc.invalidateQueries({ queryKey: ['rag-files'] });
      qc.invalidateQueries({ queryKey: ['rag-stats'] });
    },
    onError: () =>
      toast({
        title: 'Erreur',
        description: 'Suppression impossible.',
        variant: 'destructive',
      }),
  });

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-xl">Base documentaire RAG</CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Rechercher un fichier…"
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Chargement…</div>
          ) : isError ? (
            <div className="text-sm text-red-600">Erreur de chargement.</div>
          ) : files.length === 0 ? (
            <div className="text-sm text-muted-foreground">Aucun document RAG.</div>
          ) : (
            <ScrollArea className="h-[60vh] border rounded">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/50">
                  <tr>
                    <th className="p-2 text-left">Fichier</th>
                    <th className="p-2 text-left hidden md:table-cell">Chemin</th>
                    <th className="p-2 text-right">Chunks</th>
                    <th className="p-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map(f => (
                    <tr key={f.path} className="border-b last:border-0">
                      <td className="p-2 font-medium">{basename(f.path)}</td>
                      <td className="p-2 text-muted-foreground hidden md:table-cell">{f.path}</td>
                      <td className="p-2 text-right">{f.count ?? 0}</td>
                      <td className="p-2 text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => del.mutate(f.path)}
                          disabled={del.isPending}
                        >
                          Supprimer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
