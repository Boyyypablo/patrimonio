import type { Metadata } from "next";
import { DetailRoute } from "@/features/patrimonio/route-views";

export const metadata: Metadata = {
  title: "Ficha do patrimônio",
  description: "Consulte o cadastro, valores, movimentações e documentos do patrimônio.",
};

export default function Page() {
  return <DetailRoute />;
}
