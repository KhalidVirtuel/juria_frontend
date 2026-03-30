import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ragAPI, RagStats } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const basename = (p: string) => p?.split(/[\\/]/).pop() ?? p ?? '';

export default function RagStatsCard() {
  const { data, isLoading, isError, refetch } = useQuery<RagStats>({
    queryKey: ['rag-stats'],
    queryFn: ragAPI.stats, // <-- aligné avec api.ts
    staleTime: 60_000,
  });

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">RAG — Statistiques</CardTitle>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="text-sm underline underline-offset-4 hover:opacity-80"
          >
            Actualiser
          </button>
          <Link
            to="/rag-library"
            className="text-sm underline underline-offset-4 hover:opacity-80"
          >
            Voir la base RAG
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isError ? (
          <div className="text-sm text-red-600">Erreur de chargement des statistiques RAG.</div>
        ) : !data ? null : (
          <>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{data.total}</span> chunks indexés au total
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[...data.byPath]
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 8)
                    .map(d => ({ name: basename(d.path), count: d.count }))}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis allowDecimals={false} width={30} />
                  <Tooltip formatter={(v: number) => [`${v} chunks`, '']} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Répartition par fichier</div>
              <ScrollArea className="h-40 rounded border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/50">
                    <tr>
                      <th className="text-left p-2 font-medium">Fichier</th>
                      <th className="text-right p-2 font-medium">Chunks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...data.byPath]
                      .sort((a, b) => b.count - a.count)
                      .map(row => (
                        <tr key={row.path} className="border-b last:border-0">
                          <td className="p-2 truncate" title={row.path}>{basename(row.path)}</td>
                          <td className="p-2 text-right">{row.count}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
