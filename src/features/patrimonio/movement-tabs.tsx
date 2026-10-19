"use client";

import { Link } from "@/lib/navigation";
import { Button } from "@/components/ui/button";

export function MovementTabs({ active }: { active: "um" | "lote" }) {
  return (
    <nav aria-label="Modo de movimentação" className="movement-actions">
      <Button asChild variant={active === "um" ? "default" : "outline"}>
        <Link to="/movimentacao/transferir" search={{}}>
          Transferir um bem
        </Link>
      </Button>
      <Button asChild variant={active === "lote" ? "default" : "outline"}>
        <Link to="/movimentacao/lote">Transferência em lote</Link>
      </Button>
    </nav>
  );
}
