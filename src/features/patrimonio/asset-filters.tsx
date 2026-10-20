"use client";

import { useId, useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  activeFilterCount,
  emptyFilters,
  facetOptions,
  filterFacets,
  type Asset,
  type AssetFilters as Filters,
  type FilterFacet,
} from "./domain";
import { SearchInput } from "./shared";

type Props = {
  assets: Asset[];
  value: Filters;
  onChange: (next: Filters) => void;
  resultCount: number;
};

export function AssetFilters({ assets, value, onChange, resultCount }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const active = activeFilterCount(value);

  function toggle(key: FilterFacet, option: string) {
    const current = value[key];
    onChange({
      ...value,
      [key]: current.includes(option) ? current.filter((v) => v !== option) : [...current, option],
    });
  }

  const chips = [
    ...filterFacets.flatMap(({ key, label }) =>
      value[key].map((option) => ({
        id: `${key}:${option}`,
        text: `${label}: ${option}`,
        remove: () => toggle(key, option),
      })),
    ),
    ...(value.minValue.trim()
      ? [{ id: "min", text: `Valor ≥ R$ ${value.minValue}`, remove: () => onChange({ ...value, minValue: "" }) }]
      : []),
    ...(value.maxValue.trim()
      ? [{ id: "max", text: `Valor ≤ R$ ${value.maxValue}`, remove: () => onChange({ ...value, maxValue: "" }) }]
      : []),
  ];

  return (
    <section className="asset-filters" aria-label="Filtros de patrimônios">
      <div className="asset-filters-head">
        <SearchInput
          value={value.query}
          onChange={(query) => onChange({ ...value, query })}
          placeholder="Buscar por plaqueta, nome, filial, local ou responsável..."
        />
        <Button
          type="button"
          variant={open ? "default" : "outline"}
          className="asset-filters-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <SlidersHorizontal size={16} aria-hidden />
          Filtros
          {active > 0 && <span className="asset-filters-badge">{active}</span>}
          <ChevronDown size={16} aria-hidden className="asset-filters-toggle-chevron" />
        </Button>
      </div>

      <div id={panelId} className="asset-filters-bar" hidden={!open}>
        {filterFacets.map(({ key, label }) => {
          const selected = value[key];
          const options = facetOptions(assets, value, key);
          return (
            <DropdownMenu key={key}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="asset-filter-trigger"
                  data-active={selected.length > 0 || undefined}
                >
                  <span className="asset-filter-trigger-text">
                    <small>{label}</small>
                    <strong>
                      {selected.length === 0
                        ? "Todos"
                        : selected.length === 1
                          ? selected[0]
                          : `${selected.length} selecionados`}
                    </strong>
                  </span>
                  <ChevronDown size={16} aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="asset-filter-menu">
                <DropdownMenuLabel>{label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {options.map((o) => (
                  <DropdownMenuCheckboxItem
                    key={o.value}
                    className="asset-filter-item"
                    checked={selected.includes(o.value)}
                    disabled={!selected.includes(o.value) && o.count === 0}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={() => toggle(key, o.value)}
                  >
                    <span>{o.value}</span>
                    <em>{o.count}</em>
                  </DropdownMenuCheckboxItem>
                ))}
                {selected.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="asset-filter-item"
                      onSelect={() => onChange({ ...value, [key]: [] })}
                    >
                      Limpar {label.toLowerCase()}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}

        <div className="asset-filter-range" role="group" aria-label="Valor contábil (R$)">
          <small>Valor contábil (R$)</small>
          <div>
            <Input
              inputMode="decimal"
              aria-label="Valor contábil mínimo"
              placeholder="Mín."
              value={value.minValue}
              onChange={(e) => onChange({ ...value, minValue: e.target.value })}
            />
            <span aria-hidden>–</span>
            <Input
              inputMode="decimal"
              aria-label="Valor contábil máximo"
              placeholder="Máx."
              value={value.maxValue}
              onChange={(e) => onChange({ ...value, maxValue: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="asset-filters-summary" aria-live="polite">
        <span>
          {resultCount} de {assets.length} {assets.length === 1 ? "bem" : "bens"}
          {active > 0 && ` · ${active} ${active === 1 ? "filtro" : "filtros"}`}
        </span>
        {chips.length > 0 && (
          <div className="asset-filters-chips">
            {chips.map((c) => (
              <button key={c.id} type="button" className="batch-chip" onClick={c.remove} title="Remover filtro">
                {c.text}
                <X size={14} />
              </button>
            ))}
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(emptyFilters())}>
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
