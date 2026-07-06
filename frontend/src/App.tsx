import { useEffect, useState } from "react";
import type { HazardStatus } from "./api/hazards";
import { getFire, getFlood, getHeat, getWind } from "./api/hazards";
import Dashboard from "./components/Dashboard";

const POLL_INTERVAL = 30_000;

interface HazardData {
  wind: HazardStatus | null;
  heat: HazardStatus | null;
  fire: HazardStatus | null;
  flood: HazardStatus | null;
}

export default function App() {
  const [data, setData] = useState<HazardData>({
    wind: null,
    heat: null,
    fire: null,
    flood: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  async function refresh() {
    try {
      const [wind, heat, fire, flood] = await Promise.all([
        getWind(),
        getHeat(),
        getFire(),
        getFlood(),
      ]);
      setData({ wind, heat, fire, flood });
      setLastRefresh(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de connexion");
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">
            Hazard Monitor 🛰️
          </h1>
          <p className="text-slate-400 mt-1">
            Surveillance des dangers environnementaux en temps réel
          </p>
          {lastRefresh && (
            <p className="text-slate-600 text-xs mt-2">
              Dernière mise à jour : {lastRefresh.toLocaleTimeString("fr-FR")}
            </p>
          )}
        </header>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
            Erreur : {error}
          </div>
        )}

        <Dashboard data={data} />
      </div>
    </div>
  );
}
