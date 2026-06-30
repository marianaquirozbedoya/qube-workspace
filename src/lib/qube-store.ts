import { useCallback, useEffect, useState } from "react";

export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;
  subjectId: string;
  title: string;
  date: string;
  done: boolean;
  priority: Priority;
  notes?: string;
};

export type CodeBlock = { id: string; language: string; code: string };
export type NoteBlock =
  | { id: string; kind: "text"; content: string; createdAt: string }
  | { id: string; kind: "code"; language: string; code: string; createdAt: string };

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  difficulty?: "hard" | "medium" | "easy";
  lastReviewed?: string;
};

export type Subject = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  notes: NoteBlock[];
  flashcards: Flashcard[];
};

export type StickyNote = {
  id: string;
  title: string;
  body: string;
  color: string;
  createdAt: string;
};

export type AppState = {
  subjects: Subject[];
  tasks: Task[];
  stickies: StickyNote[];
};

const KEY = "qube-workspace-v1";

const PALETTE = [
  "#7A92A8",
  "#607D8B",
  "#5A7794",
  "#8AA0B5",
  "#4A6377",
  "#9AB0C2",
  "#2C3E50",
];

export function randomColor() {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const defaultState = (): AppState => ({
  subjects: [
    {
      id: uid(),
      name: "Bienvenido — Edítame",
      color: "#607D8B",
      createdAt: new Date().toISOString(),
      notes: [
        {
          id: uid(),
          kind: "text",
          content:
            "Este es tu Qube Workspace. Añade materias, programa tareas, escribe notas, añade bloques de código y repasa tarjetas didácticas (flashcards). Todo se guarda localmente en tu navegador.",
          createdAt: new Date().toISOString(),
        },
      ],
      flashcards: [
        { id: uid(), front: "¿Qué es Qube Workspace?", back: "Un espacio de estudio interactivo y minimalista para tu carrera o proyectos." },
      ],
    },
  ],
  tasks: [],
  stickies: [
    {
      id: uid(),
      title: "Recordatorio rápido",
      body: "Fija aquí cualquier cosa que no quieras olvidar.",
      color: "#7A92A8",
      createdAt: new Date().toISOString(),
    },
  ],
});

function load(): AppState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as AppState;
    return {
      subjects: parsed.subjects ?? [],
      tasks: parsed.tasks ?? [],
      stickies: parsed.stickies ?? [],
    };
  } catch {
    return defaultState();
  }
}

let memory: AppState | null = null;
const listeners = new Set<(s: AppState) => void>();

function ensure() {
  if (memory === null) memory = load();
  return memory;
}

function commit(next: AppState) {
  memory = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l(next));
}

export function useQube() {
  const [state, setState] = useState<AppState>(() => ensure());

  useEffect(() => {
    const fn = (s: AppState) => setState(s);
    listeners.add(fn);
    setState(ensure());
    return () => { listeners.delete(fn); };
  }, []);

  const update = useCallback((updater: (s: AppState) => AppState) => {
    commit(updater(ensure()));
  }, []);

  return { state, update };
}

export const fmtDate = (d: Date) => d.toISOString().slice(0, 10);