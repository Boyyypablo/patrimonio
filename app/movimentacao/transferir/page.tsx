import type { Metadata } from "next";
import { TransferRoute } from "@/features/patrimonio/route-views";

export const metadata: Metadata = {
  title: "Transferir um bem",
  description: "Escolha um patrimônio da Mútua e confirme o novo destino.",
};

export default function Page() {
  return <TransferRoute />;
}
