import type { HazardStatus } from "../api/hazards";
import HazardCard from "./HazardCard";

export default function FireCard({ data }: { data: HazardStatus | null }) {
  return (
    <HazardCard icon="🔥" title="Incendies de forêt" data={data}>
      {data && (
        <>
          <p className="text-slate-300 text-sm mb-1">{data.description}</p>
          <p className="text-slate-400 text-sm mb-3">Zone : {data.location}</p>
          <p className="text-slate-500 text-xs">{data.source}</p>
        </>
      )}
    </HazardCard>
  );
}
