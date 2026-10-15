import type { Metadata } from "next";
import { AuxPage } from "@/features/patrimonio/list-pages";

export const metadata: Metadata = {
  title: "Cadastros auxiliares",
  description: "Consulte e inclua espécies, fornecedores e localizações da Mútua.",
};

export default function Page() {
  return <AuxPage />;
}
