import type { HazardStatus } from "../api/hazards";
import HazardCard, { HazardDescription, HazardValue } from "./HazardCard";
import { ThermometerIcon } from "./icons";

export default function HeatCard({ data }: { data: HazardStatus | null }) {
  return (
    <HazardCard
      icon={<ThermometerIcon className="size-5" />}
      title="Vague de chaleur"
      data={data}
      value={data && <HazardValue value={data.value} unit={data.unit} />}
    >
      {data && <HazardDescription>{data.description}</HazardDescription>}
    </HazardCard>
  );
}
