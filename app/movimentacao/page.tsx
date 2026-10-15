import type { Metadata } from "next";
import { BatchPage } from "@/features/patrimonio/batch-page";

export const metadata: Metadata = {
  title: "Movimentação em lote",
  description: "Transfira patrimônios da Mútua para um destino comum.",
};

export default function Page() {
  return <BatchPage />;
}
