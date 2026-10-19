import { useEffect, useRef, useState } from "react";

export default function UserMenu({ showLabel = false }: { showLabel?: boolean }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div ref={root} className="relative shrink-0">
      <button
        ref={trigger}
        type="button"
        aria-label="Usuário — opções da conta"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        className="flex min-h-11 min-w-11 items-center justify-center gap-3 rounded-lg p-0.5 hover:bg-brand/5"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">U</span>
        {showLabel && <span className="hidden text-start text-xs leading-relaxed sm:block"><span className="block font-semibold">Usuário</span><span className="block text-muted">Área do usuário</span></span>}
      </button>
      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 w-56 rounded-xl bg-white p-2 shadow-card-hover">
          <p className="border-b border-line px-3 py-3 text-sm font-semibold">Conta do usuário</p>
          <button
            type="button"
            className="mt-1 flex min-h-11 w-full items-center rounded-lg px-3 text-start text-sm font-medium text-brand hover:bg-surface"
            onClick={() => {
              sessionStorage.removeItem("mutua-patrimonio-auth");
              window.location.assign("/login");
            }}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
