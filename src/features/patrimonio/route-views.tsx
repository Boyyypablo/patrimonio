"use client";

import { useParams, useSearchParams } from "next/navigation";
import { DetailPage } from "./detail-page";
import { LabelPage } from "./qr-tools";
import { TransferPage } from "./transfer-page";

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function DetailRoute() {
  const params = useParams<{ tag: string }>();
  const aba = useSearchParams().get("aba") ?? undefined;
  const tag = readParam(params.tag);
  return <DetailPage key={tag + (aba ?? "")} tag={tag} initialTab={aba} />;
}

export function LabelRoute() {
  const tag = useSearchParams().get("tag") ?? "";
  return <LabelPage key={tag} initial={tag} />;
}

export function TransferRoute() {
  const tag = useSearchParams().get("tag") ?? undefined;
  return <TransferPage key={tag ?? ""} initial={tag} />;
}
