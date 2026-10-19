import type { Metadata } from "next";
import { BatchPage } from "@/features/patrimonio/batch-page";

export const metadata: Metadata = {
  title: "Transferência em lote",
  description: "Transfira vários patrimônios da Mútua para um destino comum.",
};

export default function Page() {
  return <BatchPage />;
}
