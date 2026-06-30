import { useMemo, useState } from "react";
import { Plus, ChevronLeft, ChevronRight, X, ArrowRight, Sparkles } from "lucide-react";
import { fmtDate, randomColor, uid, useQube, type Subject, type Task } from "../../lib/qube-store";
import { Modal } from "./Modal";

type CalView = "year" | "month" | "week";

export function Dashboard({
  onOpenSubject,
}: {
  onOpenSubject: (id: string) => void;
}) {
  const { state, update } = useQube();
  const [view, setView] = useState<CalView>("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [addTaskOpen, setAddTaskOpen] = useState(false);

  const today = fmtDate(new Date());
  const subjects = state.subjects;
  const tasksByDate = useMemo(() => {
    const m = new Map<string, Task[]>();
    state.tasks.forEach((t) => {
      const arr = m.get(t.date) ?? [];
      arr.push(t);
      m.set(t.date, arr);
    });
    return m;
  }, [state.tasks]);

  const greet = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  function addSubject() {
    const name = newName.trim();
    if (!name) return;
    update((s) => ({
      ...s,
      subjects: [
        ...s.subjects,
        { id: uid(), name, color: randomColor(), createdAt: new Date().toISOString(), notes: [], flashcards: [] },
      ],
    }));
    setNewName("");
    setAddSubjectOpen(false);
  }

  return (
    <div className="mx-auto mt-6 grid w-full max-w-7xl grid-cols-12 gap-4 px-4 pb-12 anim-fade-up">
      <section className="glass col-span-12 rounded-3xl p-6 md:col-span-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-slate-deep md:text-4xl">
          {greet}. <span className="text-steel-deep">Let's study.</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          {subjects.length} subject{subjects.length === 1 ? "" : "s"} · {state.tasks.filter((t) => !t.done).length} open tasks · {state.tasks.filter((t) => t.date === today).length} due today
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => setAddSubjectOpen(true)}
            className="hover-lift inline-flex items-center gap-2 rounded-2xl bg-slate-deep px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-slate-900/10"
          >
            <Plus className="h-4 w-4" /> New Subject
          </button>
          <button
            onClick={() => { setSelectedDate(today); setAddTaskOpen(true); }}
            className="hover-lift inline-flex items-center gap-2 rounded-2xl glass-subtle px-4 py-2 text-sm font-semibold text-steel-deep"
          >
            <Sparkles className="h-4 w-4" /> Quick Task
          </button>
        </div>
      </section>

      <section className="glass col-span-12 rounded-3xl p-5 md:col-span-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-steel-deep">Subjects</h2>
          <button onClick={() => setAddSubjectOpen(true)} className="grid h-8 w-8 place-items-center rounded-xl glass-subtle hover:bg-white/60 transition" aria-label="Add subject">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <ul className="mt-3 space-y-2 max-h-[280px] overflow-auto pr-1">
          {subjects.length === 0 && (
            <li className="rounded-2xl glass-subtle p-4 text-sm text-muted-foreground">No subjects yet. Add your first one.</li>
          )}
          {subjects.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => onOpenSubject(s.id)}
                className="hover-lift group flex w-full items-center gap-3 rounded-2xl glass-subtle p-3 text-left"
              >
                <span className="h-8 w-1.5 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-deep">{s.name}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {s.flashcards.length} cards · {s.notes.length} notes
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-steel-deep opacity-0 transition group-hover:opacity-100" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="glass col-span-12 rounded-3xl p-5 md:col-span-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-display truncate text-xl font-bold text-slate-deep">
              {view === "year"
                ? cursor.getFullYear()
                : cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </h2>
            <p className="text-xs text-muted-foreground">Click a day to view tasks</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-2xl glass-subtle p-1">
              {(["year", "month", "week"] as CalView[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={
                    "rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition " +
                    (v === view ? "bg-slate-deep text-primary-foreground" : "text-steel-deep hover:bg-white/60")
                  }
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex rounded-2xl glass-subtle p-1">
              <button onClick={() => shift(view, cursor, setCursor, -1)} className="grid h-8 w-8 place-items-center rounded-xl hover:bg-white/60 transition"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setCursor(new Date())} className="rounded-xl px-2 text-xs font-semibold text-steel-deep hover:bg-white/60 transition">Today</button>
              <button onClick={() => shift(view, cursor, setCursor, 1)} className="grid h-8 w-8 place-items-center rounded-xl hover:bg-white/60 transition"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        <div className="mt-5">
          {view === "year" && <YearGrid cursor={cursor} onPickMonth={(d) => { setCursor(d); setView("month"); }} />}
          {view === "month" && (
            <MonthGrid
              cursor={cursor}
              tasksByDate={tasksByDate}
              onPickDay={(d) => setSelectedDate(d)}
              today={today}
              selected={selectedDate}
            />
          )}
          {view === "week" && <WeekGrid cursor={cursor} tasksByDate={tasksByDate} onPickDay={(d) => setSelectedDate(d)} />}
        </div>
      </section>

      <section className="glass col-span-12 rounded-3xl p-5 md:col-span-4">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-steel-deep">Today</h2>
        <p className="mt-1 text-xs text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</p>
        <ul className="mt-3 space-y-2 max-h-[300px] overflow-auto pr-1">
          {(tasksByDate.get(today) ?? []).length === 0 && (
            <li className="rounded-2xl glass-subtle p-4 text-sm text-muted-foreground">Nothing scheduled. Enjoy the calm.</li>
          )}
          {(tasksByDate.get(today) ?? []).map((t) => (
            <TaskRow key={t.id} task={t} subject={subjects.find((s) => s.id === t.subjectId)} />
          ))}
        </ul>
      </section>

      {selectedDate && (
        <DayPanel
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
          tasks={tasksByDate.get(selectedDate) ?? []}
          subjects={subjects}
          onOpenSubject={onOpenSubject}
          onAdd={() => setAddTaskOpen(true)}
        />
      )}

      <Modal open={addSubjectOpen} onClose={() => setAddSubjectOpen(false)} title="New Subject">
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-steel-deep">Subject name</label>
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addSubject(); }}
            placeholder="e.g. Quantum Mechanics"
            className="w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-steel"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setAddSubjectOpen(false)} className="rounded-2xl glass-subtle px-4 py-2 text-sm font-semibold text-steel-deep">Cancel</button>
            <button onClick={addSubject} className="rounded-2xl bg-slate-deep px-4 py-2 text-sm font-semibold text-primary-foreground">Create</button>
          </div>
        </div>
      </Modal>

      {addTaskOpen && selectedDate && (
        <AddTaskModal
          date={selectedDate}
          onClose={() => setAddTaskOpen(false)}
          onCreate={(t) => {
            update((s) => ({ ...s, tasks: [...s.tasks, t] }));
            setAddTaskOpen(false);
          }}
          subjects={subjects}
        />
      )}
    </div>
  );
}

function shift(view: CalView, cursor: Date, set: (d: Date) => void, dir: 1 | -1) {
  const d = new Date(cursor);
  if (view === "year") d.setFullYear(d.getFullYear() + dir);
  else if (view === "month") d.setMonth(d.getMonth() + dir);
  else d.setDate(d.getDate() + 7 * dir);
  set(d);
}

function YearGrid({ cursor, onPickMonth }: { cursor: Date; onPickMonth: (d: Date) => void }) {
  const year = cursor.getFullYear();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 12 }).map((_, m) => {
        const monthDate = new Date(year, m, 1);
        const days = new Date(year, m + 1, 0).getDate();
        const firstDow = new Date(year, m, 1).getDay();
        return (
          <button
            key={m}
            onClick={() => onPickMonth(monthDate)}
            className="hover-lift rounded-2xl glass-subtle p-3 text-left"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-steel-deep">
              {monthDate.toLocaleDateString(undefined, { month: "short" })}
            </p>
            <div className="mt-2 grid grid-cols-7 gap-[3px]">
              {Array.from({ length: firstDow }).map((_, i) => <span key={"e" + i} />)}
              {Array.from({ length: days }).map((_, d) => (
                <span key={d} className="aspect-square rounded-[3px] bg-steel/30" />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MonthGrid({
  cursor,
  tasksByDate,
  onPickDay,
  today,
  selected,
}: {
  cursor: Date;
  tasksByDate: Map<string, Task[]>;
  onPickDay: (d: string) => void;
  today: string;
  selected: string | null;
}) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const dows = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-2 px-1">
        {dows.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="aspect-square rounded-2xl" />;
          const iso = fmtDate(d);
          const tasks = tasksByDate.get(iso) ?? [];
          const isToday = iso === today;
          const isSel = iso === selected;
          return (
            <button
              key={iso}
              onClick={() => onPickDay(iso)}
              className={
                "hover-lift relative aspect-square rounded-2xl p-2 text-left transition " +
                (isSel ? "ring-steel " : "") +
                (isToday ? "glass-strong " : "glass-subtle ")
              }
            >
              <span className={"text-xs font-bold " + (isToday ? "text-slate-deep" : "text-steel-deep")}>
                {d.getDate()}
              </span>
              {tasks.length > 0 && (
                <span className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-0.5">
                  {tasks.slice(0, 3).map((t) => (
                    <span key={t.id} className={"h-1.5 w-1.5 rounded-full " + priorityDot(t.priority)} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekGrid({ cursor, tasksByDate, onPickDay }: { cursor: Date; tasksByDate: Map<string, Task[]>; onPickDay: (d: string) => void }) {
  const start = new Date(cursor);
  start.setDate(start.getDate() - start.getDay());
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i); return d;
  });
  const hours = Array.from({ length: 12 }).map((_, i) => i + 8);
  return (
    <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] gap-1.5">
      <div />
      {days.map((d) => (
        <button key={fmtDate(d)} onClick={() => onPickDay(fmtDate(d))} className="rounded-xl glass-subtle p-2 text-center hover:bg-white/60 transition">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{d.toLocaleDateString(undefined, { weekday: "short" })}</p>
          <p className="font-display text-sm font-bold text-slate-deep">{d.getDate()}</p>
        </button>
      ))}
      {hours.map((h) => (
        <div key={"row" + h} className="contents">
          <div className="pr-2 pt-1 text-right text-[10px] font-medium uppercase text-muted-foreground">
            {h}:00
          </div>
          {days.map((d) => {
            const iso = fmtDate(d);
            const tasks = (tasksByDate.get(iso) ?? []).slice(0, 2);
            return (
              <button key={iso + h} onClick={() => onPickDay(iso)} className="h-12 rounded-xl glass-subtle hover:bg-white/60 transition relative overflow-hidden">
                {h === 9 && tasks.map((t, i) => (
                  <span key={t.id} className={"absolute left-1 right-1 truncate rounded-md px-1 py-0.5 text-[10px] font-semibold text-primary-foreground " + priorityBg(t.priority)} style={{ top: 2 + i * 16 }}>
                    {t.title}
                  </span>
                ))}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function priorityDot(p: Task["priority"]) {
  if (p === "high") return "bg-rose-500";
  if (p === "medium") return "bg-amber-500";
  return "bg-steel";
}
function priorityBg(p: Task["priority"]) {
  if (p === "high") return "bg-rose-500/80";
  if (p === "medium") return "bg-amber-500/80";
  return "bg-steel/80";
}

function TaskRow({ task, subject }: { task: Task; subject?: Subject }) {
  const { update } = useQube();
  return (
    <li className="flex items-center gap-3 rounded-2xl glass-subtle p-3">
      <button
        onClick={() =>
          update((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)) }))
        }
        className={
          "grid h-5 w-5 shrink-0 place-items-center rounded-md border transition " +
          (task.done ? "bg-slate-deep border-slate-deep text-primary-foreground" : "border-steel/60 bg-white/70")
        }
      >
        {task.done && <span className="text-[10px]">✓</span>}
      </button>
      <div className="min-w-0 flex-1">
        <p className={"truncate text-sm font-semibold " + (task.done ? "text-muted-foreground line-through" : "text-slate-deep")}>
          {task.title}
        </p>
        {subject && <p className="text-[11px] text-muted-foreground">{subject.name}</p>}
      </div>
      <span className={"h-2.5 w-2.5 rounded-full " + priorityDot(task.priority)} />
    </li>
  );
}

function DayPanel({
  date,
  onClose,
  tasks,
  subjects,
  onOpenSubject,
  onAdd,
}: {
  date: string;
  onClose: () => void;
  tasks: Task[];
  subjects: Subject[];
  onOpenSubject: (id: string) => void;
  onAdd: () => void;
}) {
  const d = new Date(date + "T00:00:00");
  return (
    <div className="fixed inset-0 z-40 flex justify-end" style={{ background: "rgba(28,36,50,0.25)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <aside
        className="glass-strong h-full w-full max-w-md overflow-auto rounded-l-3xl p-6 anim-slide-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {d.toLocaleDateString(undefined, { weekday: "long" })}
            </p>
            <h3 className="font-display text-3xl font-extrabold text-slate-deep">
              {d.toLocaleDateString(undefined, { month: "long", day: "numeric" })}
            </h3>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full glass-subtle hover:bg-white/60 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <button onClick={onAdd} className="mt-5 w-full rounded-2xl bg-slate-deep px-4 py-2.5 text-sm font-semibold text-primary-foreground">
          <Plus className="mr-1 inline h-4 w-4" /> Add task
        </button>

        <h4 className="mt-6 mb-2 text-xs font-bold uppercase tracking-[0.15em] text-steel-deep">Scheduled</h4>
        {tasks.length === 0 && (
          <p className="rounded-2xl glass-subtle p-4 text-sm text-muted-foreground">Nothing scheduled for this day.</p>
        )}
        <ul className="space-y-2">
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} subject={subjects.find((s) => s.id === t.subjectId)} />
          ))}
        </ul>

        {subjects.length > 0 && (
          <>
            <h4 className="mt-6 mb-2 text-xs font-bold uppercase tracking-[0.15em] text-steel-deep">Open Workspace</h4>
            <div className="grid grid-cols-2 gap-2">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onOpenSubject(s.id)}
                  className="hover-lift flex items-center gap-2 rounded-2xl glass-subtle p-3 text-left"
                >
                  <span className="h-6 w-1.5 rounded-full" style={{ background: s.color }} />
                  <span className="truncate text-sm font-semibold text-slate-deep">{s.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function AddTaskModal({
  date, onClose, onCreate, subjects,
}: {
  date: string;
  onClose: () => void;
  onCreate: (t: Task) => void;
  subjects: Subject[];
}) {
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [d, setD] = useState(date);

  return (
    <Modal open onClose={onClose} title="New Task">
      <div className="space-y-3">
        <input
          autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-steel"
        />
        <div className="grid grid-cols-2 gap-3">
          <input type="date" value={d} onChange={(e) => setD(e.target.value)} className="rounded-2xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm" />
          <select value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])} className="rounded-2xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm">
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
        </div>
        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full rounded-2xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm">
          <option value="">No subject</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-2xl glass-subtle px-4 py-2 text-sm font-semibold text-steel-deep">Cancel</button>
          <button
            disabled={!title.trim()}
            onClick={() => onCreate({ id: uid(), subjectId, title: title.trim(), date: d, done: false, priority })}
            className="rounded-2xl bg-slate-deep px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >Create</button>
        </div>
      </div>
    </Modal>
  );
}