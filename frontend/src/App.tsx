import { useEffect, useState } from "react";
import type { HazardStatus } from "./api/hazards";
import { getFire, getFlood, getHeat, getWind } from "./api/hazards";
import BuildingIllustration from "./components/BuildingIllustration";
import Dashboard from "./components/Dashboard";
import { MoonIcon, RefreshIcon, SunIcon, TriangleAlertIcon } from "./components/icons";
import { useTheme } from "./hooks/useTheme";

const POLL_INTERVAL = 30_000;

interface HazardData {
  wind: HazardStatus | null;
  heat: HazardStatus | null;
  fire: HazardStatus | null;
  flood: HazardStatus | null;
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
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
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-sky-50 text-slate-900 transition-colors duration-200 dark:from-[#0a1120] dark:via-[#152057] dark:to-[#3a1470] dark:text-slate-100">
      {/*
        The gradient above is the important part: it guarantees color everywhere on the
        page, at any scroll depth, so the glass cards' backdrop-blur always has something
        vivid to refract. A flat single-color background would blur into itself and the
        glass effect would be invisible wherever a card didn't happen to sit near an accent.
      */}
      {/* Ambient accent blobs — extra depth/vividness layered on top of the base gradient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/40" />
        <div className="absolute -right-40 top-1/4 h-[34rem] w-[34rem] rounded-full bg-rose-200/45 blur-3xl dark:bg-fuchsia-500/35" />
        <div className="absolute bottom-0 left-1/4 h-[30rem] w-[30rem] rounded-full bg-amber-100/50 blur-3xl dark:bg-violet-500/35" />
        <div className="absolute -bottom-24 right-1/3 h-[26rem] w-[26rem] rounded-full bg-emerald-100/45 blur-3xl dark:bg-emerald-500/25" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-6 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="hidden size-20 shrink-0 sm:block">
              <BuildingIllustration />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold uppercase tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                Hazard Monitor
              </h1>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-500 sm:text-sm">
                Surveillance des dangers environnementaux en temps réel
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-md bg-slate-900/5 px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-900/10 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">
                <span className={`size-2 rounded-full ${error ? "bg-red-400" : "bg-emerald-400"}`} />
                {error ? "Hors ligne" : "Temps réel · 30 s"}
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
                title={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
                className="grid size-8 shrink-0 place-items-center rounded-md bg-slate-900/5 text-slate-600 ring-1 ring-slate-900/10 transition-colors hover:bg-slate-900/10 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10 dark:hover:bg-white/10"
              >
                {theme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
              </button>
            </div>
            {lastRefresh && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-900/5 px-3 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-900/10 tabular-nums dark:bg-white/5 dark:text-slate-400 dark:ring-white/10">
                <RefreshIcon className="size-3.5" />
                Actualisé à {lastRefresh.toLocaleTimeString("fr-FR")}
              </span>
            )}
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 px-4 py-3.5 text-sm ring-1 ring-red-200 dark:bg-red-500/10 dark:ring-red-500/25"
          >
            <TriangleAlertIcon className="mt-0.5 size-5 shrink-0 text-red-500 dark:text-red-400" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-300">Connexion au serveur interrompue</p>
              <p className="mt-0.5 text-red-700/70 dark:text-red-300/70">
                {error} — nouvelle tentative automatique toutes les 30 secondes.
              </p>
            </div>
          </div>
        )}

        <main>
          <Dashboard data={data} />
        </main>

        <footer className="mt-10 border-t border-slate-200 pt-5 text-center text-xs font-medium uppercase tracking-widest text-slate-500 dark:border-white/[0.06] dark:text-slate-600">
          Hazard Monitor · Données actualisées automatiquement toutes les 30 secondes
        </footer>
      </div>
    </div>
  );
}
