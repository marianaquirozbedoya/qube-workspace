import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { uid, useQube } from "../../lib/qube-store";

const COLORS = ["#E9F0F7", "#DCE5EE", "#CCD9E6", "#BFD0E0", "#E6ECF2", "#F0E6E0"];

export function Notepad() {
  const { state, update } = useQube();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function add() {
    if (!title.trim() && !body.trim()) return;
    update((s) => ({
      ...s,
      stickies: [
        { id: uid(), title: title.trim() || "Untitled", body: body.trim(), color: COLORS[Math.floor(Math.random() * COLORS.length)], createdAt: new Date().toISOString() },
        ...s.stickies,
      ],
    }));
    setTitle(""); setBody(""); setAdding(false);
  }

  function remove(id: string) {
    update((s) => ({ ...s, stickies: s.stickies.filter((x) => x.id !== id) }));
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-7xl px-4 pb-12 anim-fade-up">
      <header className="rounded-3xl glass p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Notepad</p>
            <h1 className="mt-1 font-display text-3xl font-extrabold text-slate-deep md:text-4xl">Quick reminders</h1>
          </div>
          <button onClick={() => setAdding(true)} className="hover-lift inline-flex items-center gap-2 rounded-2xl bg-slate-deep px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Plus className="h-4 w-4" /> New note
          </button>
        </div>
      </header>

      <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 [column-fill:_balance]">
        {state.stickies.map((s) => (
          <article
            key={s.id}
            className="mb-4 inline-block w-full break-inside-avoid rounded-3xl border border-white/70 p-4 shadow-[0_10px_30px_-12px_rgba(44,62,80,0.18)] backdrop-blur-xl transition hover:-translate-y-0.5"
            style={{ background: `linear-gradient(135deg, ${hexA(s.color, 0.85)}, ${hexA("#ffffff", 0.55)})` }}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-lg font-bold text-slate-deep">{s.title}</h3>
              <button onClick={() => remove(s.id)} className="opacity-50 hover:opacity-100 transition">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {s.body && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-steel-deep">{s.body}</p>}
            <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
              {new Date(s.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </p>
          </article>
        ))}
      </div>

      {adding && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 anim-fade-up" style={{ background: "rgba(28,36,50,0.35)", backdropFilter: "blur(6px)" }} onClick={() => setAdding(false)}>
          <div className="glass-strong w-full max-w-md rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl font-bold text-slate-deep">New sticky</h3>
            <input
              value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
              className="mt-3 w-full rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-steel"
            />
            <textarea
              value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write something to remember…" rows={5}
              className="mt-3 w-full resize-none rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-steel"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setAdding(false)} className="rounded-2xl glass-subtle px-4 py-2 text-sm font-semibold text-steel-deep">Cancel</button>
              <button onClick={add} className="rounded-2xl bg-slate-deep px-4 py-2 text-sm font-semibold text-primary-foreground">Pin it</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}