import type { Metadata } from "next";
import { ListPage } from "@/features/patrimonio/list-pages";

export const metadata: Metadata = {
  title: "Patrimônios",
  description: "Consulte os bens da Mútua por plaqueta, nome, filial e situação.",
};

export default function Page() {
  return <ListPage />;
}
