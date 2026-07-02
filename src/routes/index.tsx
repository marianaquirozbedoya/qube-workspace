import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopNav } from "../components/qube/TopNav";
import { Dashboard } from "../components/qube/Dashboard";
import { Workspace } from "../components/qube/Workspace";
import { Ledger } from "../components/qube/Ledger";
import { Notepad } from "../components/qube/Notepad";
import type { ViewKey } from "../components/qube/types";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [subjectId, setSubjectId] = useState<string | null>(null);

  const openSubject = (id: string) => {
    setSubjectId(id);
    setView("workspace");
  };

  return (
    <div className="min-h-screen pb-10">
      <TopNav 
        view={view} 
        onView={(v: ViewKey) => { 
          if (v !== "workspace") setSubjectId(null); 
          setView(v); 
        }} 
      />
      <main>
        {view === "dashboard" && <Dashboard onOpenSubject={openSubject} />}
        
        {view === "workspace" && subjectId && (
          <Workspace 
            subjectId={subjectId} 
            onBack={() => { 
              setSubjectId(null); 
              setView("dashboard"); 
            }} 
          />
        )}
        
        {view === "workspace" && !subjectId && (
          <div className="mx-auto mt-10 max-w-md rounded-3xl p-8 text-center glass">
            <p className="text-sm text-muted-foreground">
              Selecciona una materia desde el tablero para abrir su espacio de trabajo.
            </p>
            <button 
              onClick={() => setView("dashboard")} 
              className="mt-4 rounded-2xl bg-slate-deep px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Ir al tablero principal
            </button>
          </div>
        )}
        
        {view === "ledger" && <Ledger />}
        {view === "notepad" && <Notepad />}
      </main>
    </div>
  );
}