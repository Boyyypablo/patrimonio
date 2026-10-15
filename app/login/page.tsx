import type { Metadata } from "next";
import { LoginPage } from "@/features/patrimonio/login-page";

export const metadata: Metadata = {
  title: { absolute: "Entrar · Gestão de Patrimônio Mútua" },
  description: "Acesso à Gestão de Patrimônio da Mútua.",
};

export default function Page() {
  return <LoginPage />;
}
