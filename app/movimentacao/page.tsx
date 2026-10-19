import { redirect } from "next/navigation";

/** Entrada padrão da movimentação: transferir um bem. */
export default function Page() {
  redirect("/movimentacao/transferir");
}
