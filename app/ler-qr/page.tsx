import type { Metadata } from "next";
import { QrScanPage } from "@/features/patrimonio/qr-tools";

export const metadata: Metadata = {
  title: { absolute: "Ler QR Code — Gestão de Patrimônio Mútua" },
  description: "Aponte a câmera ou envie uma foto do QR Code da plaqueta para abrir o bem.",
};

export default function Page() {
  return <QrScanPage />;
}
