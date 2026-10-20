"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@/lib/navigation";
import { ArrowLeft, ArrowLeftRight, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { usePatrimonio } from "./store";
import { changeAsset, dateBR, emptyFilters, filterAssets, money, today, type DomainKey } from "./domain";
import { PageHeading, Field, DomainSelect, StatusBadge, Info } from "./shared";
import { MovementTabs } from "./movement-tabs";
import { AssetFilters } from "./asset-filters";

export function TransferPage({ initial }: { initial?: string | undefined }) {
  const { state, update } = usePatrimonio();
  const navigate = useNavigate();
  const start = state.assets.find((a) => a.tag === initial);
  const [tag, setTag] = useState(start && start.status !== "Baixado" ? start.tag : "");
  const [filters, setFilters] = useState(emptyFilters);
  const [tagInput, setTagInput] = useState(initial ?? "");
  const [review, setReview] = useState(false);
  const asset = state.assets.find((a) => a.tag === tag);
  const [form, setForm] = useState(() => ({
    branch: start?.branch ?? "",
    account: start?.account ?? "",
    center: start?.center ?? "",
    location: start?.location ?? "",
    responsible: start?.responsible ?? "",
    date: today(),
  }));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initial) return;
    if (!start) toast.error(`Plaqueta ${initial} não encontrada.`);
    else if (start.status === "Baixado")
      toast.error(`A plaqueta ${initial} está baixada e não aceita transferência.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const available = useMemo(
    () => state.assets.filter((a) => a.status !== "Baixado"),
    [state.assets],
  );
  const rows = useMemo(() => filterAssets(available, filters), [available, filters]);

  function pick(t: string) {
    const a = state.assets.find((x) => x.tag === t);
    if (!a) {
      toast.error(`Plaqueta ${t} não encontrada.`);
      return;
    }
    if (a.status === "Baixado") {
      toast.error(`A plaqueta ${t} está baixada e não aceita transferência.`);
      return;
    }
    setForm({
      branch: a.branch,
      account: a.account,
      center: a.center,
      location: a.location,
      responsible: a.responsible,
      date: today(),
    });
    setError("");
    setTag(t);
    setTagInput(t);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openByTag(raw: string) {
    const parsed = raw.match(/[0-9]{3,}/)?.[0] ?? raw.trim();
    if (!parsed) {
      toast.error("Informe o número da plaqueta.");
      return;
    }
    pick(parsed);
  }

  function openReview() {
    if (!asset) return;
    if (Object.values(form).some((v) => !String(v).trim())) {
      setError("Preencha todos os campos do destino e a data.");
      return;
    }
    setError("");
    setReview(true);
  }

  function confirm() {
    if (!asset) return;
    if (
      update(
        (s) => changeAsset(s, asset.tag, "Transferência", form),
        `Patrimônio ${asset.tag} transferido com sucesso.`,
      )
    ) {
      setReview(false);
      void navigate({
        to: "/patrimonios/$tag",
        params: { tag: asset.tag },
        search: { aba: "Transferências" },
      });
    }
  }

  const domain = (key: "branch" | "account" | "center" | "location" | "responsible", d: DomainKey, label: string) => (
    <Field label={label}>
      <DomainSelect
        domain={d}
        value={form[key]}
        onChange={(v) => {
          setForm({ ...form, [key]: v });
          setError("");
        }}
      />
    </Field>
  );

  if (!asset) {
    return (
      <>
        <PageHeading
          title="Movimentação"
          description="Escolha o patrimônio e informe o novo destino. Para vários bens, use a transferência em lote."
        />
        <MovementTabs active="um" />

        <div className="transfer-flow">
          <ol className="transfer-steps" aria-label="Etapas">
            <li className="transfer-step transfer-step-active">
              <span>1</span> Escolher o bem
            </li>
            <li className="transfer-step">
              <span>2</span> Definir destino
            </li>
          </ol>

          <section className="ui-panel transfer-pick">
            <h2>Qual patrimônio deseja transferir?</h2>
            <p className="section-intro">Digite a plaqueta ou busque pelo nome.</p>

            <form
              className="transfer-tag-row"
              onSubmit={(e) => {
                e.preventDefault();
                openByTag(tagInput);
              }}
            >
              <Field label="Número da plaqueta">
                <Input
                  inputMode="numeric"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="Ex.: 12307"
                  autoFocus
                />
              </Field>
              <Button type="submit" className="transfer-tag-go">
                Continuar
              </Button>
            </form>

            <div className="transfer-divider">
              <span>ou busque na lista</span>
            </div>

            <AssetFilters
              assets={available}
              value={filters}
              onChange={setFilters}
              resultCount={rows.length}
            />

            <ul className="pick-list">
              {rows.slice(0, 50).map((a) => (
                <li key={a.tag}>
                  <button type="button" className="pick-row" onClick={() => pick(a.tag)}>
                    <strong>{a.tag}</strong>
                    <span>
                      <b>{a.name}</b>
                      <small>
                        {a.branch} · {a.location}
                      </small>
                    </span>
                    <StatusBadge status={a.status} />
                  </button>
                </li>
              ))}
            </ul>
            {!rows.length && (
              <p className="p-6 text-center text-sm text-muted-foreground">
                Nenhum patrimônio encontrado. Ajuste a busca ou os filtros.
              </p>
            )}
            {rows.length > 50 && (
              <p className="p-4 text-center text-sm text-muted-foreground">
                Mostrando 50 de {rows.length}. Refine a busca ou os filtros para encontrar o bem.
              </p>
            )}
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeading
        title="Movimentação"
        description="Confira o patrimônio e informe o novo destino."
      />
      <MovementTabs active="um" />

      <div className="transfer-flow">
        <ol className="transfer-steps" aria-label="Etapas">
          <li className="transfer-step">
            <span>✓</span> Escolher o bem
          </li>
          <li className="transfer-step transfer-step-active">
            <span>2</span> Definir destino
          </li>
        </ol>

        <Button variant="ghost" className="w-fit" onClick={() => setTag("")}>
          <ArrowLeft size={16} /> Trocar patrimônio
        </Button>

        <div className="transfer-confirm">
          <section className="locked-box ui-panel" aria-label="Patrimônio selecionado">
            <h2>
              <LockKeyhole size={16} /> Bem selecionado
            </h2>
            <div className="form-grid">
              <Info label="Plaqueta" value={asset.tag} />
              <Info label="Nome" value={asset.name} />
              <Info label="Filial atual" value={asset.branch} />
              <Info label="Localização atual" value={asset.location} />
              <Info label="Responsável atual" value={asset.responsible} />
              <Info label="Valor" value={money(asset.value)} />
            </div>
          </section>

          <section className="batch-destination ui-panel">
            <h2>Novo destino</h2>
            <p className="section-intro">Informe para onde o bem vai. Situação, nome e valor não mudam.</p>
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
              <Button className="w-full" onClick={openReview}>
                <ArrowLeftRight /> Revisar transferência →
              </Button>
            </div>
          </section>
        </div>
      </div>

      <Dialog open={review} onOpenChange={setReview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar transferência</DialogTitle>
            <DialogDescription>
              Plaqueta {asset.tag} · {asset.name}
            </DialogDescription>
          </DialogHeader>
          <div className="transfer-review-grid">
            <section>
              <h3>Origem</h3>
              <dl>
                <div>
                  <dt>Filial</dt>
                  <dd>{asset.branch}</dd>
                </div>
                <div>
                  <dt>Localização</dt>
                  <dd>{asset.location}</dd>
                </div>
                <div>
                  <dt>Responsável</dt>
                  <dd>{asset.responsible}</dd>
                </div>
              </dl>
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
          <div className="form-actions">
            <Button variant="outline" onClick={() => setReview(false)}>
              Voltar
            </Button>
            <Button onClick={confirm}>Confirmar transferência</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
