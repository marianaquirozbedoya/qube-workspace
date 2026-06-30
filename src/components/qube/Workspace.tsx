import { useMemo, useState } from "react";
import { ArrowLeft, Code2, FileText, Plus, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { uid, useQube, type Flashcard, type NoteBlock } from "../../lib/qube-store";

type Tab = "notes" | "cards" | "log";

export function Workspace({ subjectId, onBack }: { subjectId: string; onBack: () => void }) {
  const { state } = useQube();
  const subject = state.subjects.find((s) => s.id === subjectId);
  const [tab, setTab] = useState<Tab>("notes");

  if (!subject) {
    return (
      <div className="mx-auto mt-10 max-w-md rounded-3xl glass p-6 text-center">
        <p className="text-sm text-muted-foreground">Subject not found.</p>
        <button onClick={onBack} className="mt-4 rounded-2xl bg-slate-deep px-4 py-2 text-sm font-semibold text-primary-foreground">Back</button>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-7xl px-4 pb-12 anim-fade-up">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={onBack} className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl glass hover:bg-white/60 transition">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="h-10 w-1.5 shrink-0 rounded-full" style={{ background: subject.color }} />
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
            <h1 className="truncate font-display text-2xl font-extrabold text-slate-deep md:text-3xl">{subject.name}</h1>
          </div>
        </div>
        <div className="flex rounded-2xl p-1 glass-subtle">
          {([
            ["notes", "Notes & Code", <FileText key="i" className="h-4 w-4" />],
            ["cards", "Flashcards", <Sparkles key="i" className="h-4 w-4" />],
            ["log", "Monthly Log", <Code2 key="i" className="h-4 w-4" />],
          ] as [Tab, string, React.ReactNode][]).map(([k, label, icon]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={
                "flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold transition " +
                (tab === k ? "bg-slate-deep text-primary-foreground" : "text-steel-deep hover:bg-white/60")
              }
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {tab === "notes" && <NotesVault subjectId={subjectId} />}
        {tab === "cards" && <FlashcardDeck subjectId={subjectId} />}
        {tab === "log" && <MonthlyLog subjectId={subjectId} />}
      </div>
    </div>
  );
}

function NotesVault({ subjectId }: { subjectId: string }) {
  const { state, update } = useQube();
  const subject = state.subjects.find((s) => s.id === subjectId)!;
  const [devMode, setDevMode] = useState(false);
  const [draft, setDraft] = useState("");
  const [lang, setLang] = useState("ts");

  function addBlock() {
    const v = draft.trim();
    if (!v) return;
    const block: NoteBlock = devMode
      ? { id: uid(), kind: "code", language: lang, code: v, createdAt: new Date().toISOString() }
      : { id: uid(), kind: "text", content: v, createdAt: new Date().toISOString() };
    update((s) => ({
      ...s,
      subjects: s.subjects.map((x) => x.id === subjectId ? { ...x, notes: [block, ...x.notes] } : x),
    }));
    setDraft("");
  }

  function remove(id: string) {
    update((s) => ({
      ...s,
      subjects: s.subjects.map((x) => x.id === subjectId ? { ...x, notes: x.notes.filter((n) => n.id !== id) } : x),
    }));
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <section className="col-span-12 rounded-3xl glass p-5 lg:col-span-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-slate-deep">New entry</h3>
          <label className="flex items-center gap-2 text-xs font-semibold text-steel-deep">
            <span>Developer Mode</span>
            <button
              onClick={() => setDevMode((v) => !v)}
              className={"relative h-6 w-11 rounded-full transition " + (devMode ? "bg-slate-deep" : "bg-steel/40")}
              aria-pressed={devMode}
            >
              <span className={"absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition " + (devMode ? "left-5" : "left-0.5")} />
            </button>
          </label>
        </div>

        {devMode && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-steel-deep">Lang</span>
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="rounded-xl glass-subtle px-2 py-1 text-xs">
              {["ts","js","py","rs","go","sql","sh","css","html"].map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        )}

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={devMode ? "// paste code here" : "Write a concept, an insight, a definition…"}
          rows={8}
          className={
            "mt-3 w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-steel " +
            (devMode
              ? "glass-dark font-mono text-emerald-200 placeholder:text-emerald-200/40 border border-emerald-400/30"
              : "border border-white/60 bg-white/70")
          }
          style={devMode ? { boxShadow: "0 0 0 1px rgba(80,180,255,0.25), 0 0 30px rgba(80,180,255,0.18)" } : undefined}
        />

        <button onClick={addBlock} className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-slate-deep px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> Save block
        </button>
      </section>

      <section className="col-span-12 space-y-3 lg:col-span-7">
        {subject.notes.length === 0 && (
          <div className="rounded-3xl glass p-8 text-center text-sm text-muted-foreground">
            No notes yet. Capture your first insight on the left.
          </div>
        )}
        {subject.notes.map((n) => (
          <article key={n.id} className="rounded-3xl glass p-5 anim-fade-up">
            <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
              <span>{new Date(n.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
              <button onClick={() => remove(n.id)} className="opacity-60 hover:opacity-100 transition"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            {n.kind === "text" ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-deep">{n.content}</p>
            ) : (
              <pre className="mono overflow-auto rounded-2xl glass-dark p-4 text-[12.5px] leading-relaxed text-emerald-200" style={{ boxShadow: "0 0 0 1px rgba(80,180,255,0.25), 0 0 30px rgba(80,180,255,0.18)" }}>
                <div className="mb-2 text-[10px] uppercase tracking-wider text-emerald-300/60">{n.language}</div>
                <code>{n.code}</code>
              </pre>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}

function FlashcardDeck({ subjectId }: { subjectId: string }) {
  const { state, update } = useQube();
  const subject = state.subjects.find((s) => s.id === subjectId)!;
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const cards = subject.flashcards;
  const card = cards[idx];

  function rate(diff: Flashcard["difficulty"]) {
    if (!card) return;
    update((s) => ({
      ...s,
      subjects: s.subjects.map((x) =>
        x.id === subjectId
          ? { ...x, flashcards: x.flashcards.map((c) => c.id === card.id ? { ...c, difficulty: diff, lastReviewed: new Date().toISOString() } : c) }
          : x
      ),
    }));
    setFlipped(false);
    setIdx((i) => (i + 1) % cards.length);
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <section className="col-span-12 lg:col-span-8">
        {cards.length === 0 ? (
          <div className="rounded-3xl glass p-10 text-center">
            <p className="text-sm text-muted-foreground">No flashcards yet.</p>
            <button onClick={() => setAddOpen(true)} className="mt-4 rounded-2xl bg-slate-deep px-4 py-2 text-sm font-semibold text-primary-foreground">
              <Plus className="mr-1 inline h-4 w-4" />Add card
            </button>
          </div>
        ) : (
          <div className="rounded-3xl glass p-5">
            <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
              <span>Card {idx + 1} of {cards.length}</span>
              <button onClick={() => { setIdx(0); setFlipped(false); }} className="inline-flex items-center gap-1 hover:text-steel-deep transition">
                <RotateCcw className="h-3 w-3" /> Restart
              </button>
            </div>

            <div className="perspective">
              <button
                onClick={() => setFlipped((f) => !f)}
                className="flip-card-inner relative block h-[320px] w-full md:h-[380px]"
                style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
              >
                <div className="backface-hidden absolute inset-0 grid place-items-center rounded-3xl glass-strong p-8 text-center">
                  <div>
                    <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Question</p>
                    <p className="font-display text-2xl font-bold text-slate-deep md:text-3xl">{card.front}</p>
                    <p className="mt-6 text-xs text-muted-foreground">Tap to reveal</p>
                  </div>
                </div>
                <div className="backface-hidden rotate-y-180 absolute inset-0 grid place-items-center rounded-3xl glass-strong p-8 text-center">
                  <div>
                    <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Answer</p>
                    <p className="text-lg leading-relaxed text-slate-deep">{card.back}</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {([
                ["hard", "Hard", "from-rose-500/30 to-rose-500/10 text-rose-700"],
                ["medium", "Medium", "from-amber-500/30 to-amber-500/10 text-amber-800"],
                ["easy", "Easy", "from-emerald-500/30 to-emerald-500/10 text-emerald-800"],
              ] as const).map(([k, l, c]) => (
                <button
                  key={k}
                  onClick={() => rate(k)}
                  className={"hover-lift rounded-2xl border border-white/60 bg-gradient-to-br py-3 text-sm font-bold backdrop-blur-md " + c}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <aside className="col-span-12 lg:col-span-4">
        <div className="rounded-3xl glass p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-slate-deep">Deck</h3>
            <button onClick={() => setAddOpen(true)} className="grid h-8 w-8 place-items-center rounded-xl glass-subtle hover:bg-white/60 transition">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <ul className="mt-3 max-h-[420px] space-y-2 overflow-auto pr-1">
            {cards.map((c, i) => (
              <li key={c.id}>
                <button
                  onClick={() => { setIdx(i); setFlipped(false); }}
                  className={"hover-lift flex w-full items-start gap-2 rounded-2xl p-3 text-left " + (i === idx ? "glass-strong" : "glass-subtle")}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-deep text-[10px] font-bold text-primary-foreground">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-deep">{c.front}</span>
                  {c.difficulty && <span className={"h-2 w-2 rounded-full " + (c.difficulty === "hard" ? "bg-rose-500" : c.difficulty === "medium" ? "bg-amber-500" : "bg-emerald-500")} />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {addOpen && <AddCardModal subjectId={subjectId} onClose={() => setAddOpen(false)} />}
    </div>
  );
}

function AddCardModal({ subjectId, onClose }: { subjectId: string; onClose: () => void }) {
  const { update } = useQube();
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 anim-fade-up" style={{ background: "rgba(28,36,50,0.35)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div className="glass-strong w-full max-w-md rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-xl font-bold text-slate-deep">New flashcard</h3>
        <div className="mt-4 space-y-3">
          <textarea value={front} onChange={(e) => setFront(e.target.value)} placeholder="Front (question)" rows={3} className="w-full resize-none rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-steel" />
          <textarea value={back} onChange={(e) => setBack(e.target.value)} placeholder="Back (answer)" rows={4} className="w-full resize-none rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-steel" />
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="rounded-2xl glass-subtle px-4 py-2 text-sm font-semibold text-steel-deep">Cancel</button>
            <button
              disabled={!front.trim() || !back.trim()}
              onClick={() => {
                update((s) => ({
                  ...s,
                  subjects: s.subjects.map((x) => x.id === subjectId ? { ...x, flashcards: [...x.flashcards, { id: uid(), front: front.trim(), back: back.trim() }] } : x),
                }));
                onClose();
              }}
              className="rounded-2xl bg-slate-deep px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthlyLog({ subjectId }: { subjectId: string }) {
  const { state } = useQube();
  const subject = state.subjects.find((s) => s.id === subjectId)!;
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const items = useMemo(() => {
    const inMonth = subject.notes.filter((n) => {
      const d = new Date(n.createdAt);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    return inMonth.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [subject.notes, month, year]);

  return (
    <div className="rounded-3xl glass p-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Monthly Log</p>
          <h3 className="font-display text-2xl font-extrabold text-slate-deep">
            {now.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">{items.length} concept{items.length === 1 ? "" : "s"}</p>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl glass-subtle p-6 text-center text-sm text-muted-foreground">Nothing logged this month yet.</p>
      ) : (
        <ol className="relative border-l-2 border-steel/30 pl-6">
          {items.map((n) => (
            <li key={n.id} className="relative mb-5">
              <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-slate-deep ring-4 ring-white/60" />
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {new Date(n.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                {n.kind === "code" && <span className="ml-2 rounded bg-slate-deep px-1.5 py-0.5 text-[9px] text-primary-foreground">{n.language}</span>}
              </p>
              <div className="mt-1 rounded-2xl glass-subtle p-3 text-sm text-slate-deep">
                {n.kind === "text" ? (
                  <p className="line-clamp-3 whitespace-pre-wrap">{n.content}</p>
                ) : (
                  <pre className="mono line-clamp-4 overflow-hidden text-[12px] text-steel-deep"><code>{n.code}</code></pre>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}