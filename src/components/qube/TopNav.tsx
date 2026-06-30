import { CalendarDays, LayoutGrid, ListChecks, StickyNote, Box } from "lucide-react";
import type { ViewKey } from "./types";

const items: { key: ViewKey; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard", label: "Dashboard", icon: <CalendarDays className="h-4 w-4" /> },
  { key: "workspace", label: "Workspace", icon: <LayoutGrid className="h-4 w-4" /> },
  { key: "ledger", label: "Ledger", icon: <ListChecks className="h-4 w-4" /> },
  { key: "notepad", label: "Notepad", icon: <StickyNote className="h-4 w-4" /> },
];

export function TopNav({
  view,
  onView,
}: {
  view: ViewKey;
  onView: (v: ViewKey) => void;
}) {
  return (
    <header className="sticky top-4 z-30 mx-auto mt-4 flex w-full max-w-7xl items-center justify-between gap-4 rounded-3xl px-4 py-3 glass">
      <div className="flex items-center gap-3 min-w-0">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-deep text-primary-foreground shadow-md">
          <Box className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-sm font-bold tracking-tight text-slate-deep truncate">Qube Hub</p>
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Glass Study OS</p>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-1 rounded-2xl p-1 glass-subtle">
        {items.map((it) => {
          const active = it.key === view;
          return (
            <button
              key={it.key}
              onClick={() => onView(it.key)}
              className={
                "flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-all " +
                (active
                  ? "bg-slate-deep text-primary-foreground shadow-md"
                  : "text-steel-deep hover:bg-white/60")
              }
            >
              {it.icon}
              {it.label}
            </button>
          );
        })}
      </nav>

      <div className="md:hidden">
        <select
          value={view}
          onChange={(e) => onView(e.target.value as ViewKey)}
          className="glass-subtle rounded-xl px-3 py-2 text-sm font-medium text-steel-deep outline-none"
        >
          {items.map((it) => (
            <option key={it.key} value={it.key}>{it.label}</option>
          ))}
        </select>
      </div>
    </header>
  );
}