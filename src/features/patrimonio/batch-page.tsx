"use client";

import { useMemo, useState } from "react";
import { Link } from "@/lib/navigation";
import { ArrowLeft, ArrowLeftRight, AlertCircle, Check, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { usePatrimonio } from "./store";
import { changeAsset, dateBR, emptyFilters, filterAssets, today, type DomainKey } from "./domain";
import { PageHeading, Field, DomainSelect, AssetTable, StatusBadge } from "./shared";
import { MovementTabs } from "./movement-tabs";
import { AssetFilters } from "./asset-filters";

type Mode = "Seleção" | "Lista" | "Intervalo";

const modeHelp: Record<Mode, string> = {
  Seleção: "Marque os bens na tabela. Ideal quando você reconhece pelo nome.",
  Lista: "Cole várias plaquetas de uma vez (planilha, e-mail, etc.).",
  Intervalo: "Informe o primeiro e o último número da sequência.",
};

export function BatchPage() {
  const { state, update } = usePatrimonio();
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<Mode>("Seleção");
  const [selected, setSelected] = useState<string[]>([]);
  const [list, setList] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const [review, setReview] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<{ tag: string; ok: boolean; message: string }[]>([]);
  const [form, setForm] = useState({
    branch: "Mútua-DF",
    account: state.domains.contas[0]?.description ?? "",
    center: "Administrativo",
    location: "Sala Administrativa",
    responsible: "Ana Paula Silva",
    date: today(),
  });

  const available = useMemo(
    () => state.assets.filter((a) => a.status !== "Baixado"),
    [state.assets],
  );

  const filtered = useMemo(() => filterAssets(available, filters), [available, filters]);
  const filteredSelected = filtered.filter((a) => selected.includes(a.tag)).length;

  function tags() {
    if (mode === "Lista") return [...new Set(list.split(/[\s,;]+/).filter(Boolean))];
    if (mode === "Intervalo") {
      const a = Number(from);
      const b = Number(to);
      return Array.from({ length: Math.min(500, Math.max(0, b - a + 1)) }, (_, i) => String(a + i));
    }
    return selected;
  }

  const picked = tags();
  const pickedAssets = useMemo(
    () => picked.map((t) => state.assets.find((a) => a.tag === t)).filter(Boolean),
    [picked, state.assets],
  );

  function goDestination() {
    if (mode === "Intervalo" && (!from || !to || Number(to) < Number(from) || Number(to) - Number(from) > 499)) {
      setError("Informe um intervalo crescente de até 500 plaquetas.");
      return;
    }
    if (!picked.length) {
      setError("Selecione ou informe ao menos uma plaqueta.");
      return;
    }
    setError("");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validate() {
    if (!form.date || Object.values(form).some((v) => !v)) {
      setError("Preencha o destino e a data.");
      return;
    }
    setError("");
    setReview(true);
  }

  function execute() {
    const out: { tag: string; ok: boolean; message: string }[] = [];
    const ok = update((s) => {
      let next = s;
      for (const tag of picked) {
        try {
          next = changeAsset(next, tag, "Transferência", form);
          out.push({ tag, ok: true, message: "Transferido para " + form.branch });
        } catch (e) {
          out.push({
            tag,
            ok: false,
            message: e instanceof Error ? e.message : "Falha simulada",
          });
        }
      }
      return next;
    }, "Processamento do lote concluído. Confira o resultado por item.");
    if (ok) {
      setResults(out);
      setReview(false);
      setSelected([]);
      setList("");
      setFrom("");
      setTo("");
      setStep(1);
      window.setTimeout(() => {
        document.getElementById("historico")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }

  const domain = (
    key: "branch" | "account" | "center" | "location" | "responsible",
    d: DomainKey,
    label: string,
  ) => (
    <Field label={label}>
      <DomainSelect domain={d} value={form[key]} onChange={(v) => setForm({ ...form, [key]: v })} />
    </Field>
  );

  function toggle(tag: string) {
    setSelected((s) => (s.includes(tag) ? s.filter((t) => t !== tag) : [...s, tag]));
    setError("");
  }

  function selectFiltered() {
    setSelected((s) => [...new Set([...s, ...filtered.map((a) => a.tag)])]);
    setError("");
  }

  function unselectFiltered() {
    const shown = new Set(filtered.map((a) => a.tag));
    setSelected((s) => s.filter((t) => !shown.has(t)));
  }

  return (
    <>
      <PageHeading
        title="Movimentação"
        description="Selecione vários bens e defina um destino comum para todos."
      />
      <MovementTabs active="lote" />

      <div className="transfer-flow">
        <ol className="transfer-steps" aria-label="Etapas">
          <li className={`transfer-step${step === 1 ? " transfer-step-active" : ""}`}>
            <span>{step > 1 ? "✓" : "1"}</span> Escolher bens
            {picked.length > 0 && <em className="batch-step-count">{picked.length}</em>}
          </li>
          <li className={`transfer-step${step === 2 ? " transfer-step-active" : ""}`}>
            <span>2</span> Definir destino
          </li>
        </ol>

        {step === 1 && (
          <section className="ui-panel" id="nova">
            <h2 className="batch-title">Quais patrimônios vão juntos?</h2>
            <p className="section-intro">{modeHelp[mode]}</p>

            <div className="segmented batch-modes" role="tablist" aria-label="Forma de seleção">
              {(
                [
                  { id: "Seleção" as const, label: "Marcar na lista" },
                  { id: "Lista" as const, label: "Colar plaquetas" },
                  { id: "Intervalo" as const, label: "Faixa de números" },
                ] as const
              ).map((m) => (
                <Button
                  key={m.id}
                  variant="ghost"
                  role="tab"
                  aria-selected={mode === m.id}
                  className={mode === m.id ? "segment-active" : ""}
                  onClick={() => {
                    setMode(m.id);
                    setError("");
                  }}
                >
                  {m.label}
                </Button>
              ))}
            </div>

            {mode === "Seleção" && (
              <>
                <AssetFilters
                  assets={available}
                  value={filters}
                  onChange={setFilters}
                  resultCount={filtered.length}
                />
                <div className="batch-toolbar">
                  <div className="batch-toolbar-actions">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectFiltered}
                      disabled={!filtered.length || filteredSelected === filtered.length}
                    >
                      Marcar filtrados ({filtered.length})
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={unselectFiltered}
                      disabled={!filteredSelected}
                    >
                      Desmarcar filtrados
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelected([])}
                      disabled={!selected.length}
                    >
                      Limpar seleção
                    </Button>
                  </div>
                </div>
                <div className="list-frame">
                  <AssetTable assets={filtered} select selected={selected} onSelect={toggle} />
                </div>
              </>
            )}

            {mode === "Lista" && (
              <div className="mt-4">
                <Field
                  label="Plaquetas"
                  hint="Separe por vírgula, espaço ou uma por linha. Ex.: 12307, 12308, 12316"
                >
                  <Textarea
                    aria-label="Plaquetas"
                    rows={6}
                    value={list}
                    onChange={(e) => {
                      setList(e.target.value);
                      setError("");
                    }}
                    placeholder={"12307\n12308\n12316"}
                  />
                </Field>
                {picked.length > 0 && (
                  <p className="batch-preview-count">{picked.length} plaqueta(s) reconhecida(s)</p>
                )}
              </div>
            )}

            {mode === "Intervalo" && (
              <div className="form-grid mt-4">
                <Field label="Da plaqueta">
                  <Input
                    type="number"
                    value={from}
                    onChange={(e) => {
                      setFrom(e.target.value);
                      setError("");
                    }}
                    placeholder="12307"
                  />
                </Field>
                <Field label="Até a plaqueta">
                  <Input
                    type="number"
                    value={to}
                    onChange={(e) => {
                      setTo(e.target.value);
                      setError("");
                    }}
                    placeholder="12316"
                  />
                </Field>
                {picked.length > 0 && from && to && Number(to) >= Number(from) && (
                  <p className="batch-preview-count">
                    Intervalo gera {picked.length} plaqueta(s) — só as existentes e ativas serão transferidas.
                  </p>
                )}
              </div>
            )}

            {picked.length > 0 && mode === "Seleção" && (
              <div className="batch-chips" aria-label="Selecionados">
                {selected.slice(0, 12).map((t) => {
                  const a = state.assets.find((x) => x.tag === t);
                  return (
                    <button key={t} type="button" className="batch-chip" onClick={() => toggle(t)} title="Remover">
                      {t}
                      {a ? ` · ${a.name}` : ""}
                      <X size={14} />
                    </button>
                  );
                })}
                {selected.length > 12 && <span className="batch-chip-more">+{selected.length - 12}</span>}
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm text-destructive mt-4">
                {error}
              </p>
            )}

            <div className="batch-footer">
              <p className="batch-footer-count">
                {picked.length === 0
                  ? "Nenhum bem selecionado"
                  : picked.length === 1
                    ? "1 bem pronto para destino"
                    : `${picked.length} bens prontos para destino`}
              </p>
              <Button onClick={goDestination} disabled={!picked.length}>
                Continuar para o destino →
              </Button>
            </div>
          </section>
        )}

        {step === 2 && (
          <>
            <Button
              variant="ghost"
              className="w-fit"
              onClick={() => {
                setStep(1);
                setError("");
              }}
            >
              <ArrowLeft size={16} /> Voltar à seleção
            </Button>

            <div className="transfer-confirm">
              <section className="ui-panel" aria-label="Bens do lote">
                <h2 className="batch-title">
                  Lote · {picked.length} {picked.length === 1 ? "bem" : "bens"}
                </h2>
                <p className="section-intro">Todos receberão o mesmo destino abaixo.</p>
                <ul className="batch-summary-list">
                  {picked.slice(0, 8).map((t) => {
                    const a = state.assets.find((x) => x.tag === t);
                    return (
                      <li key={t}>
                        <strong>{t}</strong>
                        <span>{a?.name ?? "Não encontrado no cadastro"}</span>
                        {a ? <StatusBadge status={a.status} /> : <StatusBadge status="Erro" />}
                      </li>
                    );
                  })}
                </ul>
                {picked.length > 8 && (
                  <p className="text-sm text-muted-foreground mt-3">+ {picked.length - 8} outros no lote</p>
                )}
              </section>

              <section className="batch-destination ui-panel">
                <h2 className="batch-title">Novo destino (comum a todos)</h2>
                <p className="section-intro">Filial, localização e responsável são os mais usados no dia a dia.</p>
                <div className="space-y-4">
                  {domain("branch", "filiais", "Filial de destino *")}
                  {domain("location", "localizacoes", "Localização *")}
                  {domain("responsible", "pessoas", "Responsável *")}
                  {domain("center", "centros", "Centro de custo *")}
                  {domain("account", "contas", "Conta contábil *")}
                  <Field label="Data da transferência *">
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </Field>
                  {error && (
                    <p role="alert" className="text-sm text-destructive">
                      {error}
                    </p>
                  )}
                  <Button className="w-full" onClick={validate}>
                    <ArrowLeftRight /> Revisar lote →
                  </Button>
                </div>
              </section>
            </div>
          </>
        )}

        <section id="historico" className="ui-panel">
          <div className="section-heading">
            <h2>Resultado desta sessão</h2>
            {results.length > 0 && (
              <span>
                {results.filter((r) => r.ok).length} sucesso(s) · {results.filter((r) => !r.ok).length}{" "}
                falha(s)
              </span>
            )}
          </div>
          {!results.length ? (
            <p className="text-sm text-muted-foreground">
              Depois de confirmar um lote, o resultado de cada plaqueta aparece aqui.
            </p>
          ) : (
            <div className="list-frame">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Plaqueta</th>
                    <th>Resultado</th>
                    <th>Detalhe</th>
                    <th aria-label="Abrir" />
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.tag}>
                      <td>{r.tag}</td>
                      <td>
                        <span
                          className={`inline-flex items-center gap-2 ${r.ok ? "text-success" : "text-destructive"}`}
                        >
                          {r.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                          {r.ok ? "Sucesso" : "Falha"}
                        </span>
                      </td>
                      <td>{r.message}</td>
                      <td>
                        {r.ok && (
                          <Button asChild variant="ghost" size="sm">
                            <Link to="/patrimonios/$tag" params={{ tag: r.tag }} search={{ aba: "Transferências" }}>
                              Abrir ficha
                            </Link>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <Dialog open={review} onOpenChange={setReview}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirmar transferência em lote</DialogTitle>
            <DialogDescription>
              {picked.length === 1
                ? "1 bem será transferido para o destino abaixo."
                : `${picked.length} bens serão transferidos para o mesmo destino.`}
            </DialogDescription>
          </DialogHeader>
          <div className="transfer-review-grid">
            <section>
              <h3>Lote</h3>
              <p className="text-sm font-semibold mb-2">
                {picked.length} plaqueta(s)
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {picked.slice(0, 10).join(", ")}
                {picked.length > 10 ? ` … +${picked.length - 10}` : ""}
              </p>
              {pickedAssets.length > 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                  Origens variam por bem — o destino abaixo é comum a todos.
                </p>
              )}
            </section>
            <section>
              <h3>Destino</h3>
              <dl>
                <div>
                  <dt>Filial</dt>
                  <dd>{form.branch}</dd>
                </div>
                <div>
                  <dt>Localização</dt>
                  <dd>{form.location}</dd>
                </div>
                <div>
                  <dt>Responsável</dt>
                  <dd>{form.responsible}</dd>
                </div>
                <div>
                  <dt>Data</dt>
                  <dd>{dateBR(form.date)}</dd>
                </div>
              </dl>
            </section>
          </div>
          <div className="notice">
            Plaquetas inexistentes ou bens baixados aparecem como falha no resultado, sem alterar o cadastro.
          </div>
          <div className="form-actions">
            <Button variant="outline" onClick={() => setReview(false)}>
              Voltar
            </Button>
            <Button onClick={execute}>
              <Check /> Confirmar lote
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
