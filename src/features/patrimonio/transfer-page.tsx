"use client";
import {useEffect,useMemo,useState} from 'react';
import {useNavigate} from '@/lib/navigation';
import {ArrowLeft,ArrowLeftRight,LockKeyhole} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {usePatrimonio} from './store';
import {changeAsset,dateBR,money,today,type DomainKey} from './domain';
import {PageHeading,Field,DomainSelect,SearchInput,StatusBadge,Info} from './shared';

const STEP=500;
const rangeOf=(n:number)=>{const a=Math.floor((n-1)/STEP)*STEP+1;return [a,a+STEP-1] as const;};

export function TransferPage({initial}:{initial?:string|undefined}){
 const {state,update}=usePatrimonio();const navigate=useNavigate();
 const start=state.assets.find(a=>a.tag===initial);
 const [tag,setTag]=useState(start&&start.status!=='Baixado'?start.tag:'');
 const first=rangeOf(Number(start?.tag??state.assets[0]?.tag??1));
 const [min,setMin]=useState(String(first[0]));const [max,setMax]=useState(String(first[1]));const [query,setQuery]=useState('');
 const asset=state.assets.find(a=>a.tag===tag);
 const [form,setForm]=useState(()=>({branch:start?.branch??'',account:start?.account??'',center:start?.center??'',location:start?.location??'',responsible:start?.responsible??'',date:today()}));
 const [error,setError]=useState('');
 useEffect(()=>{if(!initial)return;if(!start)toast.error(`Plaqueta ${initial} não encontrada.`);else if(start.status==='Baixado')toast.error(`A plaqueta ${initial} está baixada e não aceita transferência.`);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 const shortcuts=useMemo(()=>[...new Set(state.assets.map(a=>rangeOf(Number(a.tag))[0]))].sort((a,b)=>a-b),[state.assets]);
 const lo=Number(min)||0,hi=Number(max)||Infinity;
 const rows=useMemo(()=>{const q=query.toLowerCase();const found=state.assets.filter(a=>`${a.tag} ${a.name} ${a.branch}`.toLowerCase().includes(q));const inR=(t:string)=>Number(t)>=lo&&Number(t)<=hi;return [...found.filter(a=>inR(a.tag)),...found.filter(a=>!inR(a.tag))];},[state.assets,query,lo,hi]);
 function pick(t:string){const a=state.assets.find(x=>x.tag===t);if(!a){toast.error(`Plaqueta ${t} não encontrada.`);return;}if(a.status==='Baixado'){toast.error(`A plaqueta ${t} está baixada e não aceita transferência.`);return;}setForm({branch:a.branch,account:a.account,center:a.center,location:a.location,responsible:a.responsible,date:today()});setError('');setTag(t);window.scrollTo({top:0});}
 function confirm(){if(!asset)return;if(Object.values(form).some(v=>!String(v).trim())){setError('Preencha todos os campos do destino e a data.');return;}if(update(s=>changeAsset(s,asset.tag,'Transferência',form),`Patrimônio ${asset.tag} transferido com sucesso.`))void navigate({to:'/patrimonios/$tag',params:{tag:asset.tag},search:{aba:'Transferências'}});}
 const domain=(key:'branch'|'account'|'center'|'location'|'responsible',d:DomainKey,label:string)=><Field label={label}><DomainSelect domain={d} value={form[key]} onChange={v=>{setForm({...form,[key]:v});setError('');}}/></Field>;

 if(!asset)return <><PageHeading title="Transferir um bem" description="Escolha o patrimônio que vai mudar de destino. Para vários bens, use a movimentação em lote."/>
  <div className="transfer-pick"><SearchInput value={query} onChange={setQuery} placeholder="Buscar por plaqueta, nome ou filial"/>
  <div className="range-box"><div className="form-grid"><Field label="Plaqueta mínima"><Input inputMode="numeric" value={min} onChange={e=>setMin(e.target.value.replace(/\D/g,''))}/></Field><Field label="Plaqueta máxima"><Input inputMode="numeric" value={max} onChange={e=>setMax(e.target.value.replace(/\D/g,''))}/></Field></div>
  <div className="range-chips" role="group" aria-label="Faixas de plaqueta">{shortcuts.map(a=>{const b=a+STEP-1;const on=lo===a&&hi===b;return <Button key={a} size="sm" variant={on?'default':'outline'} aria-pressed={on} onClick={()=>{setMin(String(a));setMax(String(b));}}>{a} a {b}</Button>;})}</div>
  <p className="text-xs text-muted-foreground">A faixa só ajuda a encontrar o bem. Os bens dentro dela aparecem primeiro.</p></div>
  <ul className="pick-list">{rows.slice(0,200).map(a=><li key={a.tag}><button type="button" className="pick-row" onClick={()=>pick(a.tag)} aria-disabled={a.status==='Baixado'}><strong>{a.tag}</strong><span><b>{a.name}</b><small>{a.branch}</small></span><StatusBadge status={a.status}/></button></li>)}</ul>
  {!rows.length&&<p className="p-6 text-center text-sm text-muted-foreground">Nenhum patrimônio encontrado. Ajuste a busca.</p>}
  {rows.length>200&&<p className="p-4 text-center text-sm text-muted-foreground">Mostrando os primeiros 200 de {rows.length}. Refine a busca para encontrar o bem.</p>}</div></>;

 return <><Button variant="ghost" className="back-link" onClick={()=>setTag('')}><ArrowLeft size={16}/> Trocar patrimônio</Button><PageHeading title="Transferir um bem" description="Confira o patrimônio e informe o novo destino."/>
 <div className="transfer-confirm"><section className="locked-box" aria-label="Patrimônio selecionado"><h2><LockKeyhole size={16}/> Patrimônio</h2><div className="form-grid"><Info label="Plaqueta" value={asset.tag}/><Info label="Nome" value={asset.name}/><Info label="Descrição" value={asset.description}/><Info label="Data de aquisição" value={dateBR(asset.date)}/><Info label="Valor" value={money(asset.value)}/></div></section>
 <section className="batch-destination"><h2>Destino</h2><p className="section-intro">Situação, nome, plaqueta e valor não mudam nesta tela.</p><div className="space-y-4">{domain('branch','filiais','Filial *')}{domain('account','contas','Conta contábil *')}{domain('center','centros','Centro de custo *')}{domain('location','localizacoes','Localização *')}{domain('responsible','pessoas','Responsável *')}<Field label="Data da transferência *"><Input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></Field>{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}<Button className="w-full" onClick={confirm}><ArrowLeftRight/> Confirmar transferência</Button></div></section></div></>;}
