import type { HazardStatus } from "../api/hazards";
import FireCard from "./FireCard";
import FloodCard from "./FloodCard";
import HeatCard from "./HeatCard";
import WindCard from "./WindCard";

interface Props {
  data: {
    wind: HazardStatus | null;
    heat: HazardStatus | null;
    fire: HazardStatus | null;
    flood: HazardStatus | null;
  };
}

export default function Dashboard({ data }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <WindCard data={data.wind} />
      <HeatCard data={data.heat} />
      <FireCard data={data.fire} />
      <FloodCard data={data.flood} />
    </div>
  );
}
