import RagStatsCard from '@/components/dashboard/RagStatsCard';
export default function Dashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {/* … tes autres cards … */}
      <div className="md:col-span-2">
        <RagStatsCard />
      </div>
    </div>
  );
}