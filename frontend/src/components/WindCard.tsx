import type { HazardStatus } from "../api/hazards";
import HazardCard, { HazardDescription, HazardValue } from "./HazardCard";
import { WindIcon } from "./icons";

export default function WindCard({ data }: { data: HazardStatus | null }) {
  return (
    <HazardCard
      icon={<WindIcon className="size-5" />}
      title="Vents violents"
      data={data}
      value={data && <HazardValue value={data.value} unit={data.unit} />}
    >
      {data && <HazardDescription>{data.description}</HazardDescription>}
    </HazardCard>
  );
}
