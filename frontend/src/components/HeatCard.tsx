import type { HazardStatus } from "../api/hazards";
import HazardCard from "./HazardCard";

export default function HeatCard({ data }: { data: HazardStatus | null }) {
  return (
    <HazardCard icon="🌡️" title="Vague de chaleur" data={data}>
      {data && (
        <>
          <p className="text-4xl font-bold text-slate-100 mb-1">
            {data.value}{" "}
            <span className="text-base font-normal text-slate-400">{data.unit}</span>
          </p>
          <p className="text-slate-300 text-sm mb-3">{data.description}</p>
          <p className="text-slate-500 text-xs">{data.source}</p>
        </>
      )}
    </HazardCard>
  );
}
