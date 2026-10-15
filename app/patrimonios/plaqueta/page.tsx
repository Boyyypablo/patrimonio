import type { Metadata } from "next";
import { LabelRoute } from "@/features/patrimonio/route-views";

export const metadata: Metadata = {
  title: "Gerar plaqueta",
  description: "Gere a etiqueta com QR Code do patrimônio da Mútua.",
};

export default function Page() {
  return <LabelRoute />;
}
