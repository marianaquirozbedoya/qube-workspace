import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-fade-up"
      style={{ background: "rgba(28, 36, 50, 0.35)", backdropFilter: "blur(6px)" }}
      onMouseDown={(e) => { if (e.target === ref.current) onClose(); }}
      ref={ref}
    >
      <div className="glass-strong w-full max-w-md rounded-3xl p-6 anim-fade-up">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-deep">{title}</h3>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full glass-subtle hover:bg-white/60 transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
