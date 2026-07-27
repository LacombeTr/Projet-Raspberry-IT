import { useEffect, useState } from "react";
import type { HazardStatus } from "./api/hazards";
import { getFire, getFlood, getHeat, getWind } from "./api/hazards";
import Dashboard from "./components/Dashboard";
import {
  BellIcon,
  BellOffIcon,
  MoonIcon,
  RefreshIcon,
  ShieldIcon,
  SunIcon,
  TriangleAlertIcon,
} from "./components/icons";
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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
          <div className="flex items-center gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/40">
              <ShieldIcon className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold uppercase tracking-tight text-blue-700 sm:text-3xl dark:text-sky-300">
                Hazard Monitor
              </h1>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-slate-600 sm:text-sm dark:text-slate-400">
                Surveillance des dangers environnementaux en temps réel
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ${
                  error
                    ? "bg-red-100 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/25"
                    : "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25"
                }`}
              >
                <span className={`size-2 rounded-full ${error ? "bg-red-500" : "bg-emerald-500"}`} />
                {error ? "Hors ligne" : "Système Actif"}
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
                title={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
                className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-900/5 text-slate-600 ring-1 ring-slate-900/10 transition-colors hover:bg-slate-900/10 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10 dark:hover:bg-white/10"
              >
                {theme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
              </button>
              <button
                type="button"
                onClick={() => setNotificationsEnabled((v) => !v)}
                title={notificationsEnabled ? "Désactiver les notifications" : "Activer les notifications"}
                aria-label={notificationsEnabled ? "Désactiver les notifications" : "Activer les notifications"}
                aria-pressed={notificationsEnabled}
                className={`grid size-9 shrink-0 place-items-center rounded-full ring-1 transition-colors ${
                  notificationsEnabled
                    ? "bg-blue-500/15 text-blue-600 ring-blue-300 hover:bg-blue-500/25 dark:bg-blue-500/20 dark:text-blue-300 dark:ring-blue-500/30 dark:hover:bg-blue-500/30"
                    : "bg-slate-900/5 text-slate-600 ring-slate-900/10 hover:bg-slate-900/10 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10 dark:hover:bg-white/10"
                }`}
              >
                {notificationsEnabled ? <BellIcon className="size-4" /> : <BellOffIcon className="size-4" />}
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
