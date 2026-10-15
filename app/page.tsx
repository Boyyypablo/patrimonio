import type { Metadata } from "next";
import { HomePage } from "@/features/patrimonio/list-pages";

export const metadata: Metadata = {
  title: { absolute: "Gestão de Patrimônio" },
  description: "Gestão de Patrimônio da Mútua: acompanhe os bens, valores e movimentações.",
};

export default function Page() {
  return <HomePage />;
}
