import type { HazardStatus } from "../api/hazards";
import HazardCard, { HazardDescription } from "./HazardCard";
import { FlameIcon } from "./icons";

export default function FireCard({ data }: { data: HazardStatus | null }) {
  return (
    <HazardCard icon={<FlameIcon className="size-5" />} title="Incendies de forêt" data={data}>
      {data && <HazardDescription>{data.description}</HazardDescription>}
    </HazardCard>
  );
}
