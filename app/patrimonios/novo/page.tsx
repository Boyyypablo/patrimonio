import type { Metadata } from "next";
import { NewPage } from "@/features/patrimonio/new-page";

export const metadata: Metadata = {
  title: "Novo patrimônio",
  description: "Cadastre um novo bem no patrimônio da Mútua.",
};

export default function Page() {
  return <NewPage />;
}
