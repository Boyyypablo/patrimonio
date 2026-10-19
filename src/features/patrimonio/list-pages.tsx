"use client";
import {Link,useNavigate,useSearch} from '@/lib/navigation';
import {useState} from 'react';
import {Plus,ChevronLeft,ChevronRight,SlidersHorizontal,X,Pencil,Trash2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {usePatrimonio} from './store';
import {modules, type ModuleCategory} from './shell';
import {PatrimonioActions} from './qr-tools';
import {money,labels,type DomainKey,type Option} from './domain';
import {PageHeading,NewButton,AssetTable,SearchInput,Field,DomainDialog} from './shared';

type HomeTab = "all" | ModuleCategory;

export function HomePage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<HomeTab>("all");
  const q = query.toLocaleLowerCase("pt-BR").trim();

  const rows = modules.filter((m) => {
    const matchTab = tab === "all" || m.category === tab;
    const hay = `${m.homeLabel} ${m.label} ${m.homeDesc} ${m.categoryLabel}`.toLocaleLowerCase("pt-BR");
    return matchTab && (!q || hay.includes(q));
  });

  return (
    <div className="home-page">
      <nav className="home-breadcrumb" aria-label="Breadcrumb">
        <img src="/assets/25230.svg" alt="" width={14} height={14} />
        <span>Área do usuário</span>
        <img src="/assets/f4894.svg" alt="" width={12} height={12} />
        <strong>Início</strong>
      </nav>

      <header className="home-hero">
        <p className="home-eyebrow">Seu espaço de gestão</p>
        <h1>Tudo começa por aqui.</h1>
        <p className="home-subtitle">Seu patrimônio organizado. Sua gestão mais simples.</p>
      </header>

      <section className="home-banner" aria-label="Destaque">
        <div className="home-banner-photo" aria-hidden>
          <img src="/assets/home-banner-boxes.png" alt="" />
        </div>
        <div className="home-banner-copy">
          <h2 className="hero-title">
            Cada bem tem uma história.
            <br />
            Cuide de todas elas.
          </h2>
          <Button asChild className="home-banner-cta">
            <Link to="/patrimonios">
              Consultar patrimônios
              <img src="/assets/1d580.svg" alt="" width={18} height={22} />
            </Link>
          </Button>
        </div>
      </section>

      <section className="home-services" id="seus-servicos" aria-labelledby="services-heading">
        <div className="home-services-head">
          <div className="home-services-title">
            <h2 id="services-heading">Seus serviços</h2>
            <span className="home-badge">{modules.length} módulos</span>
          </div>
          <label className="home-search">
            <img src="/assets/9437c.svg" alt="" width={16} height={16} />
            <span className="sr-only">Buscar serviço</span>
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar serviço..."
              aria-label="Buscar serviço"
            />
          </label>
        </div>

        <div className="home-tabs" role="tablist" aria-label="Filtrar serviços">
          {(
            [
              { id: "all", label: "Todos os serviços" },
              { id: "gestao", label: "Gestão patrimonial" },
              { id: "admin", label: "Administração" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={`home-tab${tab === item.id ? " home-tab-active" : ""}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="home-grid">
          {rows.map((m) => (
            <Link key={m.to} to={m.to as "/"} className="home-card">
              <div className="home-card-top">
                <span className="home-card-icon">
                  <img src={`/assets/${m.iconAsset}`} alt="" width={24} height={24} />
                </span>
                <img src="/assets/b2786.svg" alt="" width={16} height={16} className="home-card-arrow" />
              </div>
              <p className="home-card-cat">{m.categoryLabel}</p>
              <h3>{m.homeLabel}</h3>
              <p className="home-card-desc">{m.homeDesc}</p>
            </Link>
          ))}
        </div>

        {!rows.length && (
          <div className="home-empty-card">
            <p>Nenhum serviço encontrado para “{query}”.</p>
            <Button
              type="button"
              onClick={() => {
                setQuery("");
                setTab("all");
              }}
            >
              Limpar busca e filtros
            </Button>
          </div>
        )}
      </section>

      <footer className="home-footer">
        <p>© {new Date().getFullYear()} Mútua · Gestão de Patrimônio</p>
        <p>Cuidar do patrimônio é cuidar do futuro.</p>
      </footer>
    </div>
  );
}

export function ListPage() {
  const { state } = usePatrimonio();
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("");
  const [status, setStatus] = useState("");
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const rows = state.assets.filter(
    (a) =>
      (!branch || a.branch === branch) &&
      (!status || a.status === status) &&
      `${a.tag} ${a.name}`.toLowerCase().includes(query.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const current = Math.min(page, pages);
  const active = state.assets.filter((a) => a.status === "Ativo").length;
  const totalValue = state.assets.reduce((n, a) => n + a.value, 0);

  return (
    <>
      <PageHeading
        title="Patrimônios"
        description="Consulte e acompanhe todos os bens da sua organização."
        action={
          <div className="asset-page-actions">
            <Button asChild variant="outline">
              <Link to="/patrimonios/plaqueta">Gerar plaqueta</Link>
            </Button>
            <NewButton />
            <PatrimonioActions />
          </div>
        }
      />
      <div className="stats-row">
        <article className="ui-panel stat-panel">
          <p>Total de patrimônios</p>
          <strong>{state.assets.length}</strong>
        </article>
        <article className="ui-panel stat-panel">
          <p>Bens ativos</p>
          <strong>{active}</strong>
        </article>
        <article className="ui-panel stat-panel">
          <p>Valor de aquisição total</p>
          <strong>{money(totalValue)}</strong>
        </article>
      </div>
      <section className="ui-panel" id="consultar">
        <div className="filter-band">
          <SearchInput
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
          />
          <Field label="Filial">
            <select
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todas as filiais</option>
              {state.domains.filiais.map((o) => (
                <option key={o.id}>{o.description}</option>
              ))}
            </select>
          </Field>
          <Field label="Situação">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todas as situações</option>
              {["Ativo", "Avariado", "Baixado"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Button
            variant="ghost"
            onClick={() => {
              setQuery("");
              setBranch("");
              setStatus("");
              setPage(1);
            }}
          >
            <X size={15} />
            Limpar
          </Button>
        </div>
        <div className="section-heading">
          <h2>{rows.length} patrimônios encontrados</h2>
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={14} /> Lista de bens
          </span>
        </div>
        <div className="list-frame">
          <AssetTable assets={rows.slice((current - 1) * size, current * size)} />
          <div className="table-footer">
            <label className="flex items-center gap-2">
              Itens por página{" "}
              <select
                aria-label="Itens por página"
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 25, 50].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-3">
              <span>
                Página {current} de {pages} · {rows.length} registros
              </span>
              <Button
                variant="outline"
                size="icon"
                aria-label="Página anterior"
                disabled={current === 1}
                onClick={() => setPage(current - 1)}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Próxima página"
                disabled={current === pages}
                onClick={() => setPage(current + 1)}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
export function AuxPage(){const {state,update}=usePatrimonio();const search=useSearch({strict:false}) as {lista?:string};const navigate=useNavigate();const domain=(search.lista&&search.lista in labels?search.lista:'filiais') as DomainKey;const setDomain=(d:DomainKey)=>void navigate({to:'/cadastros',search:{lista:d} as never});const [query,setQuery]=useState('');const [open,setOpen]=useState(false);const [editing,setEditing]=useState<Option|undefined>(undefined);const [deleting,setDeleting]=useState<Option|undefined>(undefined);const rows=state.domains[domain].filter(o=>`${o.id} ${o.description}`.toLowerCase().includes(query.toLowerCase()));function remove(){if(!deleting)return;const item=deleting;update(s=>({...s,domains:{...s.domains,[domain]:s.domains[domain].filter(o=>o.id!==item.id)}}),'Cadastro excluído com sucesso.');setDeleting(undefined);}return <><PageHeading title="Cadastros auxiliares" description="Mantenha as informações que dão suporte à sua gestão." action={<Button onClick={()=>{setEditing(undefined);setOpen(true);}}><Plus/> Novo cadastro</Button>}/><div className="aux-layout"><nav className="aux-nav ui-panel" aria-label="Listas auxiliares">{Object.entries(labels).map(([key,label])=><Button variant="ghost" className={domain===key?'aux-active':''} onClick={()=>{setDomain(key as DomainKey);setQuery('');}} key={key}>{label}<span>{state.domains[key as DomainKey].length}</span></Button>)}</nav><section className="ui-panel"><div className="section-heading"><h2>{labels[domain]}</h2><span>{rows.length} registros</span></div><SearchInput value={query} onChange={setQuery} placeholder="Buscar por código ou descrição..."/><div className="list-frame mt-5"><table className="data-table"><thead><tr><th>Código</th><th>{domain==='fornecedores'?'Razão social':'Descrição'}</th>{domain==='fornecedores'&&<><th>CNPJ</th><th>Nome fantasia</th></>}{domain==='localizacoes'&&<th>Centro de custo</th>}<th aria-label="Ações"/></tr></thead><tbody>{rows.map(o=><tr key={o.id}><td className="text-muted-foreground">{o.id}</td><td>{o.description}</td>{domain==='fornecedores'&&<><td>{o.cnpj??'Não informado'}</td><td>{o.fantasy??o.description}</td></>}{domain==='localizacoes'&&<td>{o.center??'Administrativo'}</td>}<td><div className="flex gap-1 justify-end"><Button variant="ghost" size="icon" title="Editar" aria-label={`Editar ${o.description}`} onClick={()=>{setEditing(o);setOpen(true);}}><Pencil size={16}/></Button><Button variant="ghost" size="icon" title="Excluir" aria-label={`Excluir ${o.description}`} onClick={()=>setDeleting(o)}><Trash2 size={16}/></Button></div></td></tr>)}</tbody></table>{!rows.length&&<p className="p-8 text-muted-foreground">Nenhum cadastro encontrado. Limpe a busca para ver os itens.</p>}</div></section></div><DomainDialog domain={domain} open={open} onOpenChange={o=>{setOpen(o);if(!o)setEditing(undefined);}} editing={editing}/><Dialog open={!!deleting} onOpenChange={o=>{if(!o)setDeleting(undefined);}}><DialogContent><DialogHeader><DialogTitle>Excluir cadastro</DialogTitle><DialogDescription>Esta ação remove o item das listas desta sessão.</DialogDescription></DialogHeader><p className="text-sm">Excluir <strong>{deleting?.description}</strong> de {labels[domain]}?</p><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setDeleting(undefined)}>Cancelar</Button><Button variant="destructive" onClick={remove}>Excluir</Button></div></DialogContent></Dialog></>;}
