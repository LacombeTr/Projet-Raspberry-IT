import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  iconClasses: string;
  label: string;
  value: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
}

/** Small glass stat tile used in the top overview row (temperature, gusts, …). */
export default function StatCard({ icon, iconClasses, label, value, footer, loading }: Props) {
  return (
    <article className="group relative isolate flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/25 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.1)] backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 hover:-translate-y-1 dark:border-white/15 dark:bg-white/[0.07] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-y-10 -left-1/4 w-2/5 rotate-[16deg] bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-500 group-hover:translate-x-6 dark:via-white/10"
      />
      <div className="relative flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</p>
        <div className={`grid size-9 shrink-0 place-items-center rounded-xl ${iconClasses}`}>{icon}</div>
      </div>

      {loading ? (
        <div className="relative mt-3 flex-1 animate-pulse space-y-2">
          <div className="h-7 w-20 rounded-lg bg-slate-900/5 dark:bg-white/10" />
          <div className="h-2.5 w-24 rounded bg-slate-900/5 dark:bg-white/10" />
        </div>
      ) : (
        <>
          <p className="relative mt-2 text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums sm:text-3xl dark:text-white">
            {value}
          </p>
          {footer && <div className="relative mt-1.5 truncate text-xs font-medium">{footer}</div>}
        </>
      )}
    </article>
  );
}
