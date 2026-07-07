import type { HazardStatus } from "../api/hazards";
import HazardCard, { HazardDescription } from "./HazardCard";
import { WavesIcon } from "./icons";

export default function FloodCard({ data }: { data: HazardStatus | null }) {
  return (
    <HazardCard icon={<WavesIcon className="size-5" />} title="Inondations" data={data}>
      {data && <HazardDescription>{data.description}</HazardDescription>}
    </HazardCard>
  );
}
