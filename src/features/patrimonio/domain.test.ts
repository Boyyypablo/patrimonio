import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  accounting,
  changeAsset,
  competence,
  createAsset,
  activeFilterCount,
  depreciation,
  emptyFilters,
  facetOptions,
  filterAssets,
  finishAccounting,
  initialState,
  parsePeriod,
  parseTag,
  periodBR,
  periodBreakdown,
  startAccounting,
} from "./domain.ts";

describe("Governança patrimonial", () => {
  it("impede plaquetas duplicadas", () => {
    const state = initialState();
    const asset = state.assets.find((item) => item.tag === "12316");
    if (!asset) throw new Error("Bem inicial ausente");
    assert.throws(() => createAsset(state, asset), /já existe/);
  });

  it("edita somente a descrição e preserva histórico", () => {
    const state = initialState();
    const next = changeAsset(state, "12316", "Descrição", { description: "Avaria leve", branch: "Mútua-DF" });
    const asset = next.assets.find((item) => item.tag === "12316");
    assert.equal(asset?.description, "Avaria leve");
    assert.equal(asset?.branch, "Mútua-AC");
    assert.equal(asset?.history.length, 2);
  });

  it("transfere, adiciona, ajusta valor e bloqueia movimentações após baixa", () => {
    let state = initialState();
    state = changeAsset(state, "12316", "Transferência", {
      branch: "Mútua-DF",
      account: "Conta",
      center: "TI",
      location: "Sala TI",
      responsible: "Ana",
      date: "2026-10-13",
    });
    state = changeAsset(state, "12316", "Adição", {
      description: "RAM 16GB",
      document: "998877",
      supplier: "Dell",
      date: "2026-10-13",
      value: 350,
    });
    assert.equal(state.assets.find((item) => item.tag === "12316")?.book, 2851.06);
    state = changeAsset(state, "12316", "Impairment", { value: 2100 });
    const asset = state.assets.find((item) => item.tag === "12316");
    if (!asset) throw new Error("Ausente");
    const net = depreciation(asset).at(-1)?.net;
    assert.ok(net !== undefined && net < 2100);
    state = changeAsset(state, "12316", "Baixa", {
      reason: "Extravio",
      destination: "Boletim",
      observation: "Processo 10",
    });
    assert.equal(state.assets.find((item) => item.tag === "12316")?.history.length, 5);
    assert.throws(() => changeAsset(state, "12316", "Transferência", {}), /baixado/);
    assert.throws(() => changeAsset(state, "12316", "Adição", { value: 350 }), /baixado/);
  });

  it("detalha bens, exclusões e composição da competência", () => {
    const state = initialState();
    const breakdown = periodBreakdown(state, "2026-10");
    assert.equal(breakdown.lines.length, 9);
    assert.ok(breakdown.excluded.some((item) => item.reason === "Baixado"));
    assert.ok(breakdown.monthly > 0);
    assert.equal(
      Number(breakdown.book.toFixed(2)),
      Number((breakdown.residual + breakdown.base).toFixed(2)),
    );
    const sumMonthly = breakdown.lines.reduce((n, line) => n + line.monthly, 0);
    assert.equal(Number(breakdown.monthly.toFixed(4)), Number(sumMonthly.toFixed(4)));
  });

  it("exige cálculo antes de contabilização", () => {
    const state = initialState();
    assert.throws(() => accounting(state, "2026-10", "Contabilização"), /Calcule/);
    const next = accounting(accounting(state, "2026-10", "Cálculo"), "2026-10", "Contabilização");
    assert.equal(next.periods[0]?.posted, true);
    assert.ok((next.periods[0]?.total ?? 0) > 0);
  });
});

describe("Competências mensais", () => {
  it("consulta mês e ano", () => {
    assert.equal(parsePeriod("10/2026"), "2026-10");
    assert.equal(periodBR("2026-10"), "10/2026");
    assert.equal(parsePeriod("13/2026"), null);
    assert.throws(() => accounting(initialState(), "2026-13", "Cálculo"), /válida/);
  });

  it("mostra etapas independentes, datas e quantidade calculada", () => {
    let state = initialState();
    assert.equal(competence(state, "2026-10").calculation.status, "Não iniciado");
    assert.throws(() => startAccounting(state, "2026-10", "Contabilização"), /Calcule/);
    state = startAccounting(state, "2026-10", "Cálculo", 1000);
    assert.equal(competence(state, "2026-10").calculation.status, "Em andamento");
    assert.equal(competence(state, "2026-10").posting.status, "Não iniciado");
    assert.throws(() => startAccounting(state, "2026-10", "Cálculo"), /Aguarde/);
    state = finishAccounting(state, 3000);
    const calculated = competence(state, "2026-10");
    assert.equal(calculated.calculation.status, "Concluído");
    assert.equal(calculated.count, 9);
    assert.ok(calculated.calculation.date);
    state = startAccounting(state, "2026-10", "Contabilização", 4000);
    assert.equal(competence(state, "2026-10").posting.status, "Em andamento");
    state = finishAccounting(state, 6000);
    assert.equal(competence(state, "2026-10").posting.status, "Concluído");
    assert.ok(competence(state, "2026-10").posting.date);
    assert.throws(() => accounting(state, "2026-10", "Cálculo"), /já foi contabilizada/);
  });

  it("preserva o total e a quantidade do cálculo ao contabilizar", () => {
    let state = accounting(initialState(), "2026-10", "Cálculo");
    const snapshot = state.periods[0];
    state = changeAsset(state, "12316", "Baixa", {
      reason: "Fim da vida útil",
      destination: "Reciclagem",
      observation: "",
    });
    state = accounting(state, "2026-10", "Contabilização");
    assert.equal(state.periods[0]?.count, snapshot?.count);
    assert.equal(state.periods[0]?.total, snapshot?.total);
  });

  it("mostra erro por etapa e permite nova tentativa sem apagar o histórico", () => {
    let state = startAccounting(initialState(), "2026-10", "Cálculo", 1000);
    state = { ...state, jobs: state.jobs.map((job) => ({ ...job, fail: true })) };
    state = finishAccounting(state, 3000);
    assert.equal(competence(state, "2026-10").calculation.status, "Erro");
    assert.ok(competence(state, "2026-10").calculation.date);
    state = finishAccounting(startAccounting(state, "2026-10", "Cálculo", 4000), 6000);
    assert.equal(competence(state, "2026-10").calculation.status, "Concluído");
    assert.equal(state.jobs.length, 2);
    assert.equal(state.jobs[1]?.status, "Erro");
  });
});

describe("Filtros de bens", () => {
  const assets = initialState().assets;
  const tags = (list: { tag: string }[]) => list.map((a) => a.tag).sort();

  it("combina filtros diferentes com E e valores do mesmo filtro com OU", () => {
    const f = { ...emptyFilters(), branch: ["Mútua-AC"], location: ["Recepção"] };
    assert.deepEqual(tags(filterAssets(assets, f)), ["12308", "12316"]);
    const orLocations = { ...f, location: ["Recepção", "Sala de TI"] };
    assert.deepEqual(tags(filterAssets(assets, orLocations)), ["12308", "12310", "12314", "12316"]);
    assert.deepEqual(tags(filterAssets(assets, { ...orLocations, status: ["Avariado"] })), ["12310"]);
  });

  it("filtra por faixa de valor contábil e por texto", () => {
    const range = { ...emptyFilters(), minValue: "1.000", maxValue: "2000" };
    assert.deepEqual(tags(filterAssets(assets, range)), ["12308", "12309", "12314"]);
    assert.deepEqual(tags(filterAssets(assets, { ...emptyFilters(), query: "dell" })), ["12307", "12309"]);
    assert.equal(activeFilterCount({ ...range, branch: ["Mútua-AC", "Mútua-DF"] }), 4);
  });

  it("conta as opções considerando os demais filtros", () => {
    const options = facetOptions(assets, { ...emptyFilters(), location: ["Recepção"], branch: ["Mútua-SP"] }, "branch");
    assert.equal(options.find((o) => o.value === "Mútua-AC")?.count, 2);
    assert.equal(options.find((o) => o.value === "Mútua-DF")?.count, 1);
    assert.equal(options.find((o) => o.value === "Mútua-SP")?.count, 0);
  });
});

it("lê plaqueta do QR", () => {
  for (const sample of ["plaqueta: 12316", "plaqueta=12316", '{"plaqueta":"12316"}', "Plaqueta 12316", "12316"]) {
    assert.equal(parseTag(sample), "12316");
  }
  assert.equal(parseTag("00123"), "00123");
  assert.equal(parseTag("abc"), null);
});
