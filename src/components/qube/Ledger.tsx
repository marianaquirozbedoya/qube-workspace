import { useMemo } from "react";
import { Flame, Check } from "lucide-react";
import { useQube, type Task } from "../../lib/qube-store";

function daysUntil(iso: string) {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(iso + "T00:00:00");
  return Math.round((+d - +today) / 86400000);
}

export function Ledger() {
  const { state, update } = useQube();
  const subjects = state.subjects;

  const sorted = useMemo(() => {
    return [...state.tasks]
      .filter((t) => !t.done)
      .sort((a, b) => +new Date(a.date) - +new Date(b.date));
  }, [state.tasks]);

  function sizeClass(t: Task) {
    const days = daysUntil(t.date);
    if (days <= 1) return "col-span-12 md:col-span-8 row-span-2";
    if (days <= 3) return "col-span-12 md:col-span-4 row-span-2";
    if (days <= 7) return "col-span-6 md:col-span-4";
    return "col-span-6 md:col-span-3";
  }

  function urgencyLabel(t: Task) {
    const d = daysUntil(t.date);
    if (d < 0) return { text: `${Math.abs(d)}d overdue`, tone: "bg-rose-600 text-white" };
    if (d === 0) return { text: "Due today", tone: "bg-rose-500 text-white" };
    if (d === 1) return { text: "Tomorrow", tone: "bg-amber-500 text-white" };
    if (d <= 7) return { text: `In ${d} days`, tone: "bg-steel-deep text-white" };
    return { text: `In ${d} days`, tone: "bg-steel/60 text-slate-deep" };
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-7xl px-4 pb-12 anim-fade-up">
      <header className="rounded-3xl glass p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Priority Ledger</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-slate-deep md:text-4xl">Deadlines & exams</h1>
        <p className="mt-2 text-sm text-muted-foreground">Cards grow with urgency. Tap to mark complete.</p>
      </header>

      {sorted.length === 0 ? (
        <div className="mt-6 rounded-3xl glass p-10 text-center text-sm text-muted-foreground">
          No open tasks — your ledger is clear.
        </div>
      ) : (
        <div className="mt-6 grid auto-rows-[120px] grid-cols-12 gap-4">
          {sorted.map((t) => {
            const subject = subjects.find((s) => s.id === t.subjectId);
            const u = urgencyLabel(t);
            const days = daysUntil(t.date);
            const big = days <= 1;
            return (
              <article key={t.id} className={"relative overflow-hidden rounded-3xl p-5 hover-lift " + sizeClass(t) + " " + (big ? "glass-strong" : "glass")}>
                {subject && (
                  <span className="absolute left-0 top-0 h-full w-1.5" style={{ background: subject.color }} />
                )}
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className={"rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider " + u.tone}>{u.text}</span>
                    {big && <Flame className="h-5 w-5 text-rose-500" />}
                  </div>
                  <h3 className={"mt-2 font-display font-extrabold text-slate-deep " + (big ? "text-2xl md:text-3xl" : "text-base")}>
                    {t.title}
                  </h3>
                  {subject && <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{subject.name}</p>}
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <p className="text-xs text-muted-foreground">{new Date(t.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</p>
                    <button
                      onClick={() => update((s) => ({ ...s, tasks: s.tasks.map((x) => x.id === t.id ? { ...x, done: true } : x) }))}
                      className="grid h-8 w-8 place-items-center rounded-xl glass-subtle hover:bg-white/60 transition"
                      aria-label="Mark done"
                    >
                      <button className="hidden" />
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}