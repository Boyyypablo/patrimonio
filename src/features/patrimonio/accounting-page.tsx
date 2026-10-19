"use client";

import { useMemo, useState } from "react";
import {
  Calculator,
  CheckCircle2,
  Clock,
  RefreshCw,
  FileCheck2,
  Minus,
  Plus,
  Equal,
  ChevronDown,
  ChevronUp,
  ListTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/lib/navigation";
import { usePatrimonio } from "./store";
import {
  competence,
  startAccounting,
  money,
  dateBR,
  parsePeriod,
  periodBR,
  periodBreakdown,
  type AccountingStatus,
} from "./domain";
import { PageHeading, Field, StatusBadge } from "./shared";

function Stage({
  label,
  status,
  date,
}: {
  label: string;
  status: AccountingStatus;
  date: string | undefined;
}) {
  return (
    <div className="competence-stage">
      <span>{label}</span>
      <StatusBadge status={status} />
      <small>{date ? dateBR(date) : "Sem registro"}</small>
    </div>
  );
}

export function AccountingPage() {
  const { state, update } = usePatrimonio();
  const [reference, setReference] = useState("10/2026");
  const [period, setPeriod] = useState("2026-10");
  const [error, setError] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const summary = competence(state, period);
  const breakdown = useMemo(
    () => (showSummary ? periodBreakdown(state, period) : null),
    [state, period, showSummary],
  );
  const pending =
    summary.calculation.status === "Em andamento" || summary.posting.status === "Em andamento";
  const calculated = summary.calculation.status === "Concluído";
  const displayTotal = calculated ? summary.total : (breakdown?.monthly ?? 0);
  const periods = [
    ...new Set([period, ...state.periods.map((p) => p.period), ...state.jobs.map((j) => j.period)]),
  ].sort((a, b) => b.localeCompare(a));

  function consult() {
    const value = parsePeriod(reference);
    if (!value) {
      setError("Informe o mês e o ano no formato MM/AAAA, por exemplo 10/2026.");
      return;
    }
    setError("");
    setPeriod(value);
  }

  function select(value: string) {
    setPeriod(value);
    setReference(periodBR(value));
    setError("");
  }

  function run(kind: "Cálculo" | "Contabilização") {
    if (parsePeriod(reference) !== period) {
      setError("Consulte a competência informada antes de iniciar.");
      return;
    }
    setError("");
    update(
      (s) => startAccounting(s, period, kind),
      kind === "Cálculo" ? "Cálculo iniciado." : "Contabilização iniciada.",
    );
  }

  return (
    <div className="accounting-page">
      <PageHeading
        title="Contabilização"
        description="Gerencie o cálculo de depreciação e o fechamento das competências."
      />

      <section className="accounting-card">
        <header className="accounting-card-head">
          <h2>Competência do período</h2>
          <p>Informe o mês e o ano no formato MM/AAAA.</p>
        </header>
        <form
          className="competence-search"
          onSubmit={(e) => {
            e.preventDefault();
            consult();
          }}
        >
          <Field label="Mês e ano de referência *">
            <Input
              inputMode="numeric"
              maxLength={7}
              placeholder="10/2026"
              value={reference}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                setReference(
                  digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits,
                );
                setError("");
              }}
            />
          </Field>
          <Button type="submit" variant="outline">
            Consultar
          </Button>
        </form>
        {error && (
          <p role="alert" className="accounting-error">
            {error}
          </p>
        )}
      </section>

      <section className="accounting-card" aria-label="Etapas da competência">
        <header className="accounting-card-head">
          <h2>Etapas · {periodBR(period)}</h2>
          <p>Calcule e, em seguida, contabilize a competência consultada.</p>
        </header>
        <ol className="accounting-steps">
          <li
            className={`accounting-step ${summary.calculation.status === "Concluído" ? "accounting-done" : ""}`}
          >
            <div className="accounting-step-top">
              <span className="accounting-step-icon" aria-hidden>
                <Calculator size={22} />
              </span>
              <div className="accounting-step-copy">
                <small>Etapa 1</small>
                <h3>Calcular o período</h3>
                <p>Calcula a depreciação dos bens para o mês consultado.</p>
              </div>
              <StatusBadge status={summary.calculation.status} />
            </div>
            <Button
              className="accounting-step-action"
              disabled={pending || summary.posted}
              onClick={() => run("Cálculo")}
            >
              {summary.calculation.status === "Concluído" ? (
                <RefreshCw size={16} />
              ) : (
                <Calculator size={16} />
              )}
              {summary.calculation.status === "Erro"
                ? "Tentar cálculo novamente"
                : summary.calculation.status === "Concluído"
                  ? "Recalcular"
                  : "Calcular"}
            </Button>
          </li>
          <li
            id="contabilizar"
            className={`accounting-step ${summary.posted ? "accounting-done" : ""}`}
          >
            <div className="accounting-step-top">
              <span className="accounting-step-icon" aria-hidden>
                <FileCheck2 size={22} />
              </span>
              <div className="accounting-step-copy">
                <small>Etapa 2</small>
                <h3>Contabilizar a competência</h3>
                <p>Efetiva o resultado após o cálculo do período.</p>
              </div>
              <StatusBadge status={summary.posting.status} />
            </div>
            <Button
              className="accounting-step-action"
              disabled={summary.calculation.status !== "Concluído" || pending || summary.posted}
              onClick={() => run("Contabilização")}
            >
              <CheckCircle2 size={16} />
              {summary.posting.status === "Erro"
                ? "Tentar contabilizar novamente"
                : "Contabilizar"}
            </Button>
          </li>
        </ol>
        <div className="notice accounting-notice">
          <Clock size={17} />
          <span>
            A contabilização só fica disponível após o cálculo. Sem envio para sistemas contábeis.
          </span>
        </div>
      </section>

      <section className="accounting-card accounting-summary-block">
        <div className="period-summary-toggle">
          <Button
            type="button"
            variant={showSummary ? "outline" : "default"}
            aria-expanded={showSummary}
            aria-controls="period-summary-panel"
            onClick={() => setShowSummary((v) => !v)}
          >
            <ListTree size={16} />
            {showSummary ? "Ocultar resumo do período" : "Ver resumo do período"}
            {showSummary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
          {!showSummary && (
            <p className="period-summary-toggle-hint">
              Composição, lista de bens e exclusões de {periodBR(period)}.
            </p>
          )}
        </div>

        {showSummary && breakdown && (
          <aside
            id="period-summary-panel"
            className="period-summary"
            aria-labelledby="period-summary-title"
          >
            <div className="period-summary-head">
              <h2 id="period-summary-title">Resumo do período</h2>
              <span>{periodBR(period)}</span>
            </div>

            <div className="period-summary-status">
              <StatusBadge status={summary.calculation.status} />
              <StatusBadge status={summary.posting.status} />
            </div>

            <div className="period-total">
              <span>{calculated ? "Total da depreciação" : "Depreciação estimada do mês"}</span>
              <strong>{money(displayTotal)}</strong>
              {!calculated && (
                <small className="period-total-hint">
                  Prévia com base nos bens atuais. Confirme com Calcular.
                </small>
              )}
            </div>

            <div className="period-summary-grid">
              <section className="period-math" aria-label="Composição do cálculo">
                <h3>Composição</h3>
                <ul>
                  <li>
                    <span className="period-math-op" aria-hidden>
                      <Plus size={14} />
                    </span>
                    <span className="period-math-label">Valor contábil dos bens</span>
                    <strong>{money(breakdown.book)}</strong>
                  </li>
                  <li>
                    <span className="period-math-op period-math-minus" aria-hidden>
                      <Minus size={14} />
                    </span>
                    <span className="period-math-label">Valor residual</span>
                    <strong>{money(breakdown.residual)}</strong>
                  </li>
                  <li className="period-math-subtotal">
                    <span className="period-math-op" aria-hidden>
                      <Equal size={14} />
                    </span>
                    <span className="period-math-label">Base depreciável</span>
                    <strong>{money(breakdown.base)}</strong>
                  </li>
                  <li>
                    <span className="period-math-op" aria-hidden>
                      ÷
                    </span>
                    <span className="period-math-label">Vida útil linear</span>
                    <strong>60 meses</strong>
                  </li>
                  <li className="period-math-result">
                    <span className="period-math-op" aria-hidden>
                      <Equal size={14} />
                    </span>
                    <span className="period-math-label">Depreciação do mês</span>
                    <strong>{money(breakdown.monthly)}</strong>
                  </li>
                </ul>
                <dl className="period-details">
                  <div>
                    <dt>Depreciação acumulada</dt>
                    <dd>{money(breakdown.accumulated)}</dd>
                  </div>
                  <div>
                    <dt>Valor líquido estimado</dt>
                    <dd>{money(breakdown.net)}</dd>
                  </div>
                  <div>
                    <dt>Bens considerados</dt>
                    <dd>{calculated ? summary.count : breakdown.lines.length}</dd>
                  </div>
                  <div>
                    <dt>Data do cálculo</dt>
                    <dd>
                      {summary.calculation.date
                        ? dateBR(summary.calculation.date)
                        : "Não iniciado"}
                    </dd>
                  </div>
                  <div>
                    <dt>Data da contabilização</dt>
                    <dd>
                      {summary.posting.date ? dateBR(summary.posting.date) : "Não iniciado"}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="period-items" aria-label="Bens do cálculo">
                <div className="period-items-head">
                  <h3>Bens no cálculo</h3>
                  <span>
                    {breakdown.lines.length}{" "}
                    {breakdown.lines.length === 1 ? "item" : "itens"}
                  </span>
                </div>
                {breakdown.lines.length === 0 ? (
                  <p className="period-items-empty">
                    Nenhum bem elegível nesta competência (baixados ou sem depreciação).
                  </p>
                ) : (
                  <ul className="period-item-list">
                    {breakdown.lines.map((line) => (
                      <li key={line.tag}>
                        <div className="period-item-main">
                          <Link
                            to="/patrimonios/$tag"
                            params={{ tag: line.tag }}
                            search={{ aba: "Depreciação" }}
                            className="period-item-link"
                          >
                            <strong>{line.name}</strong>
                            <small>
                              Plaqueta {line.tag} · {line.months}{" "}
                              {line.months === 1 ? "mês" : "meses"}
                            </small>
                          </Link>
                          <span className="period-item-monthly">{money(line.monthly)}</span>
                        </div>
                        <div className="period-item-meta">
                          <span>
                            Contábil <em>{money(line.book)}</em>
                          </span>
                          <span>
                            − Residual <em>{money(line.residual)}</em>
                          </span>
                          <span>
                            = Base <em>{money(line.base)}</em>
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {breakdown.lines.length > 0 && (
                  <div className="period-items-sum">
                    <span>Soma das depreciações do mês</span>
                    <strong>{money(breakdown.monthly)}</strong>
                  </div>
                )}

                {breakdown.excluded.length > 0 && (
                  <div className="period-excluded">
                    <div className="period-items-head">
                      <h3>Excluídos</h3>
                      <span>{breakdown.excluded.length}</span>
                    </div>
                    <ul className="period-excluded-list">
                      {breakdown.excluded.map((item) => (
                        <li key={item.tag}>
                          <span>
                            {item.name} · {item.tag}
                          </span>
                          <small>{item.reason}</small>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            </div>

            <div className="period-summary-close">
              <Button type="button" variant="outline" onClick={() => setShowSummary(false)}>
                <ChevronUp size={16} /> Ocultar resumo
              </Button>
            </div>
          </aside>
        )}
      </section>

      <section id="competencias" className="accounting-card">
        <header className="accounting-card-head accounting-card-head-row">
          <div>
            <h2>Lista de competências</h2>
            <p>Selecione um período para consultar novamente.</p>
          </div>
          <span className="accounting-count">
            {periods.length} {periods.length === 1 ? "competência" : "competências"}
          </span>
        </header>
        <div className="competence-list">
          {periods.map((value) => {
            const row = competence(state, value);
            return (
              <article
                className={`competence-row ${value === period ? "competence-selected" : ""}`}
                key={value}
                aria-label={`Competência ${periodBR(value)}`}
              >
                <button
                  type="button"
                  className="competence-period"
                  onClick={() => select(value)}
                  aria-label={`Consultar competência ${periodBR(value)}`}
                >
                  {periodBR(value)}
                </button>
                <Stage
                  label="Cálculo"
                  status={row.calculation.status}
                  date={row.calculation.date}
                />
                <Stage
                  label="Contabilização"
                  status={row.posting.status}
                  date={row.posting.date}
                />
                <div className="competence-amount">
                  <span>Total da depreciação</span>
                  <strong>{money(row.total)}</strong>
                  <small>{row.count} bens considerados</small>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
