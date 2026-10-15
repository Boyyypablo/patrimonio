import type { Metadata } from "next";
import { AccountingPage } from "@/features/patrimonio/accounting-page";

export const metadata: Metadata = {
  title: "Contabilização",
  description: "Calcule a depreciação, contabilize competências e acompanhe processamentos.",
};

export default function Page() {
  return <AccountingPage />;
}
