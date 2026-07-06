import type { ReactNode } from "react";
import type { HazardStatus } from "../api/hazards";

const SEVERITY_STYLES = {
  ok: { border: "border-green-500", badge: "bg-green-500" },
  warning: { border: "border-amber-500", badge: "bg-amber-500" },
  danger: { border: "border-red-500", badge: "bg-red-500" },
};

interface Props {
  icon: string;
  title: string;
  data: HazardStatus | null;
  children?: ReactNode;
}

export default function HazardCard({ icon, title, data, children }: Props) {
  const styles = data ? SEVERITY_STYLES[data.severity] : null;

  return (
    <div
      className={`bg-slate-800 rounded-xl p-6 border-l-4 ${styles?.border ?? "border-slate-600"}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-lg font-semibold text-slate-100 flex-1">{title}</h2>
        {data && (
          <span
            className={`${styles!.badge} text-white text-xs font-bold px-2 py-1 rounded`}
          >
            {data.severity.toUpperCase()}
          </span>
        )}
      </div>
      <div>
        {!data ? (
          <p className="text-slate-500 italic">Chargement...</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
