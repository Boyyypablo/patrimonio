import { useState } from "react";
import Workspace from "./Workspace";
import UserMenu from "./UserMenu";

function Icon({ name, className = "size-5" }: { name: string; className?: string }) {
  const assets: Record<string, string> = { help: "d07d3.svg", grid: "25230.svg", chevron: "f4894.svg", search: "9437c.svg", box: "18c47.svg", move: "e5913.svg", chart: "2758c.svg", qr: "d5849.svg", settings: "0ab4a.svg", arrow: "b2786.svg" };
  return <span className={`inline-flex shrink-0 items-center justify-center ${className}`} aria-hidden="true"><img src={`/assets/${assets[name] || assets.grid}`} alt="" className="max-w-none" /></span>;
}

function PatrimonyIllustration() {
  return <div className="patrimony-illustration" aria-hidden="true">
    <div className="orbit orbit-outer"/><div className="orbit orbit-middle"/><div className="orbit orbit-inner"/><div className="orbit-center"/>
    <img className="art-cube" src="/assets/4d12c.svg" alt=""/>
    <div className="art-qr"><img src="/assets/6bdac.svg" alt=""/></div>
    <div className="art-phone"><img src="/assets/4a1f5.svg" alt=""/></div>
    <div className="art-tv"><img src="/assets/228d2.svg" alt=""/></div>
    <div className="art-lock"><img src="/assets/b3527.svg" alt=""/></div>
    <div className="art-printer"><img src="/assets/57d78.svg" alt=""/></div>
    <div className="art-usb"><img src="/assets/e7e17.svg" alt=""/></div>
  </div>;
}

const modules = [
  { name: "Patrimônios", icon: "box", category: "Gestão de bens", description: "Todos os seus bens, em um só lugar. Consulte, cadastre e acompanhe cada patrimônio.", path: "/patrimonios", actions: ["Consultar patrimônios", "Cadastrar novo bem", "Gerar plaqueta"] },
  { name: "Movimentação", icon: "move", category: "Operações", description: "Transfira um bem ou vários de uma vez, com agilidade e rastreabilidade.", path: "/movimentacao/transferir", actions: ["Transferir um bem", "Transferir em lote"] },
  { name: "Contabilização", icon: "chart", category: "Financeiro", description: "Calcule a depreciação e gerencie a contabilização por competência.", path: "/contabilizacao", actions: ["Consultar competência", "Ver competências"] },
  { name: "Ler QR Code", icon: "qr", category: "Identificação", description: "Encontre a ficha de um bem usando a câmera ou uma foto da plaqueta.", path: "/ler-qr", actions: ["Ler com a câmera", "Enviar foto da plaqueta"] },
  { name: "Cadastros auxiliares", icon: "settings", category: "Configurações", description: "Organize filiais, responsáveis, localizações e os dados da sua operação.", path: "/cadastros", actions: ["Gerenciar cadastros", "Consultar filiais"] },
];

export default function App() {
  return window.location.pathname === "/" ? <Home /> : <Workspace />;
}

function Home() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos os serviços");
  const [selected] = useState<number | null>(null);
  const setSelected = (index: number | null) => { window.location.href = index === null ? "/" : modules[index].path; };
  const [help, setHelp] = useState(false);
  const filtered = modules.filter(m => `${m.name} ${m.description}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")) && (filter === "Todos os serviços" || (filter === "Gestão patrimonial" ? ["box", "move", "qr"].includes(m.icon) : ["chart", "settings"].includes(m.icon))));
  return <div className="home-screen min-h-screen bg-canvas text-ink">
    <header className="border-b border-line bg-transparent">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 lg:px-12">
        <a href="/" aria-label="Mútua — início" className="flex items-center gap-4">
          <img src="/assets/778f5.png" alt="Mútua — Caixa de Assistência dos Profissionais do Crea" className="h-auto w-36 object-contain sm:w-48" />
          <span className="hidden h-9 border-l border-line sm:block"/><span className="hidden text-base font-semibold leading-5 text-muted sm:block">Gestão de<br/><span className="text-ink">Patrimônio</span></span>
        </a>
        <div className="flex items-center gap-5"><button onClick={() => setHelp(!help)} aria-label="Abrir ajuda" aria-expanded={help} className="rounded-lg p-2.5 text-muted hover:bg-canvas"><Icon name="help"/></button><div className="border-l border-line ps-5"><UserMenu showLabel /></div></div>
      </div>
    </header>
    <div className="mx-auto max-w-[1248px] px-6 pb-8 pt-8 lg:px-12">
      <div className="mb-0 flex items-center gap-2 text-xs text-muted"><Icon name="grid" className="size-3.5"/><span>Área do usuário</span><Icon name="chevron" className="size-3"/><span className="font-medium text-brand">Início</span></div>
      {help && <aside className="mb-6 rounded-xl bg-brand/5 p-5 text-sm leading-relaxed"><strong>Como podemos ajudar?</strong><p className="mt-2 text-muted">Selecione um serviço para conhecer suas funções. Em Patrimônios, você consulta os bens; em Movimentação, transfere bens; em Contabilização, gerencia competências. Esta proposta ainda não está conectada ao sistema original.</p></aside>}
      <section className="flex min-h-[131px] flex-wrap items-end justify-between gap-4 pt-5">
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">SEU ESPAÇO DE GESTÃO</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tudo começa por aqui.</h1><p className="mt-3 text-sm leading-relaxed text-muted">Seu patrimônio organizado. Sua gestão mais simples.</p></div>
        
      </section>
      {selected === null ? <>
        <section className="mt-8">
          <div className="home-hero relative min-h-[298.5px] w-full overflow-hidden rounded-2xl bg-brand px-6 py-8 text-white sm:px-10">
            <PatrimonyIllustration />
            <div className="relative z-10 flex min-h-[234.5px] flex-col items-start justify-between py-5">
              <h2 className="hero-title text-3xl font-semibold sm:text-[36px]">Cada bem tem uma história.<br/>Cuide de todas elas.</h2>
              <button onClick={() => setSelected(0)} className="mt-10 inline-flex min-h-[46px] items-center gap-5 rounded-lg bg-white px-4 py-3 text-[15px] font-semibold leading-4 text-brand hover:bg-slate-100">Consultar patrimônios<img src="/assets/1d580.svg" alt="" width="18" height="22" /></button>
            </div>
          </div>
        </section>
        <section className="mt-10" aria-labelledby="services-heading">
          <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><h2 id="services-heading" className="text-xl font-bold tracking-tight">Seus serviços</h2><span className="rounded-md bg-brand/5 px-2 py-1 text-xs font-medium text-muted">5 módulos</span></div><label className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-line bg-white px-3 sm:w-64"><Icon name="search" className="size-4 text-muted"/><span className="sr-only">Buscar serviço</span><input type="search" name="servico" value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar serviço..." className="min-w-0 flex-1 bg-transparent py-2 text-base outline-offset-2 sm:text-xs"/></label></div>
          <div className="my-5 flex flex-wrap gap-2">{["Todos os serviços", "Gestão patrimonial", "Administração"].map(f => <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)} className={`rounded-lg px-3.5 py-2.5 text-xs font-medium ${filter === f ? "bg-brand text-white" : "text-muted hover:bg-white"}`}>{f}</button>)}</div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(m => <button key={m.name} onClick={() => setSelected(modules.indexOf(m))} className="group flex min-h-60 flex-col rounded-xl bg-white p-6 text-start shadow-card transition-shadow hover:shadow-card-hover"><div className="flex w-full items-center justify-between"><span className="flex size-11 items-center justify-center rounded-xl bg-brand/5 text-brand"><Icon name={m.icon} className="size-6"/></span><Icon name="arrow" className="size-4 text-muted group-hover:text-brand"/></div><span className="mt-5 text-[10px] font-semibold uppercase tracking-widest text-muted">{m.category}</span><h3 className="mt-1.5 text-base font-bold tracking-tight">{m.name}</h3><p className="mt-2 text-xs leading-[19.5px] text-muted">{m.description}</p></button>)}
          </div>
          {filtered.length === 0 && <div className="mt-6 rounded-xl bg-white p-8 text-center"><p>Nenhum serviço encontrado para “{query}”.</p><button onClick={() => { setQuery(""); setFilter("Todos os serviços"); }} className="mt-4 rounded-lg bg-brand px-4 py-3 text-sm text-white">Limpar busca e filtros</button></div>}
        </section>
      </> : <section className="mt-8 rounded-2xl bg-white p-8 shadow-card"><button onClick={() => setSelected(null)} className="mb-8 text-sm font-semibold text-brand">← Voltar aos serviços</button><div className="mb-5 flex size-14 items-center justify-center rounded-xl bg-brand/5 text-brand"><Icon name={modules[selected].icon} className="size-7"/></div><h2 className="text-2xl font-bold">{modules[selected].name}</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{modules[selected].description}</p><h3 className="mt-8 text-sm font-semibold">O que você pode fazer neste módulo</h3><ul className="mt-4 space-y-3">{modules[selected].actions.map(a => <li key={a} className="flex items-center gap-3 text-sm text-muted"><Icon name="check" className="size-4 text-brand"/>{a}</li>)}</ul><p className="mt-8 rounded-lg bg-canvas p-4 text-xs leading-relaxed text-muted">Prévia da nova central de serviços. O módulo original <code>{modules[selected].path}</code> será conectado na integração com o projeto Next.js. Nenhuma operação ou dado foi alterado.</p></section>}
      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-[10px] text-muted"><p>© {new Date().getFullYear()} Mútua · Gestão de Patrimônio</p><p>Cuidar do patrimônio é cuidar do futuro.</p></footer>
    </div>
  </div>;
}
