export type Status = 'Ativo' | 'Avariado' | 'Baixado';
export type DomainKey = 'filiais'|'contas'|'centros'|'pessoas'|'especies'|'fornecedores'|'localizacoes'|'motivos'|'destinos';
export type Option = {id:string; description:string; cnpj?:string; fantasy?:string; center?:string};
export type Event = {id:string; date:string; type:string; description:string};
export type Addition = {description:string; document:string; supplier:string; date:string; value:number};
export type Attachment = {id:string; name:string; type:string; date:string; data:string};
export type Asset = {tag:string; name:string; description:string; branch:string; account:string; species:string; status:Status; quantity:number; supplier:string; document:string; date:string; start:string; period:string; value:number; residual:number; center:string; location:string; responsible:string; book:number; history:Event[]; additions:Addition[]; attachments:Attachment[]};
export type Processing = {id:string; period:string; kind:'Cálculo'|'Contabilização'; status:'Em processamento'|'Concluído'|'Erro'; date:string; due:number; fail:boolean; completedAt?:string|undefined};
export type Period = {period:string; calculated:boolean; posted:boolean; calculatedAt?:string|undefined; postedAt?:string|undefined; total:number; count?:number|undefined};
export type State = {assets:Asset[]; domains:Record<DomainKey,Option[]>; periods:Period[]; jobs:Processing[]};
export const money = (n:number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n);
export const dateBR = (date:string) => date ? new Date(date.length===10?date+'T12:00:00':date).toLocaleDateString('pt-BR') : '—';
export const today = () => new Date().toISOString().slice(0,10);
export const event = (type:string, description:string):Event => ({id:crypto.randomUUID(),date:new Date().toISOString(),type,description});
export const labels:Record<DomainKey,string> = {filiais:'Filiais',contas:'Contas contábeis',centros:'Centros de custo',pessoas:'Pessoas',especies:'Espécies',fornecedores:'Fornecedores',localizacoes:'Localizações',motivos:'Motivos de baixa',destinos:'Destinos de baixa'};
const options = (values:string[]):Option[] => values.map((description,i)=>({id:String(i+1).padStart(3,'0'),description}));
export function initialState():State {
 const domains:State['domains'] = {filiais:options(['Mútua-AC','Mútua-DF','Mútua-SP','Mútua Nacional']),contas:options(['1.2.3.01 · Máquinas e equipamentos','1.2.3.02 · Móveis e utensílios','1.2.3.03 · Equipamentos de informática']),centros:options(['Administrativo','Atendimento','Tecnologia','Diretoria']),pessoas:options(['Ana Paula Silva','Carlos Eduardo Lima','Mariana Oliveira','Roberto Santos']),especies:options(['Imobilizado','Informática','Mobiliário']),fornecedores:options(['Gree do Brasil','Dell Computadores','Móveis Brasil']),localizacoes:options(['Sala Administrativa','Recepção','Sala de Reuniões 01','Sala de TI']),motivos:options(['Fim da vida útil','Extravio ou furto','Dano irreparável','Doação']),destinos:options(['Reciclagem','Boletim de ocorrência','Descarte autorizado','Instituição beneficiária'])};
 const names = ['Notebook Dell Latitude 5440','Mesa de escritório','Monitor Dell 24 polegadas','Cadeira ergonômica','Impressora multifuncional HP','Projetor Epson PowerLite','Armário de aço','Nobreak APC 1500VA','Telefone IP Intelbras','Ar Condicionado 9000 BTUS'];
 const values=[6890,1250,1890,980,2450,4200,890,1650,420,2501.06];
 const assets:Asset[] = names.map((name,i)=>({tag:String(12307+i),name,description:i===9?'Ar Condicionado 9000 BTUS, marca Gree':name+' — uso administrativo',branch:i===5?'Mútua-DF':'Mútua-AC',account:(domains.contas[i%3]?.description??'Não informado'),species:i%3===0?'Informática':i%3===1?'Mobiliário':'Imobilizado',status:i===6?'Baixado':i===3||i===8?'Avariado':'Ativo',quantity:1,supplier:i===9?'Gree do Brasil':(domains.fornecedores[i%3]?.description??'Não informado'),document:String(998801+i),date:'2025-07-25',start:'2025-08-01',period:'2025-07',value:(values[i]??0),residual:10,center:(domains.centros[i%4]?.description??'Não informado'),location:(domains.localizacoes[i%4]?.description??'Não informado'),responsible:(domains.pessoas[i%4]?.description??'Não informado'),book:(values[i]??0),history:[{id:'seed-'+i,date:'2025-07-25T12:00:00',type:'Cadastro',description:'Bem incorporado ao patrimônio. Cadastro concluído.'},...(i===6?[{id:'seed-baixa',date:'2026-09-20T12:00:00',type:'Baixa',description:'Fim da vida útil · Reciclagem · Descarte autorizado.'}]:[]),...(i===3||i===8?[{id:'seed-status-'+i,date:'2026-09-28T12:00:00',type:'Situação',description:'Ativo → Avariado · Desgaste físico identificado na inspeção.'}]:[])],additions:[],attachments:[]}));
 return {assets,domains,periods:[],jobs:[]};
}
export function createAsset(state:State,asset:Asset):State {
 if(state.assets.some(a=>a.tag===asset.tag)) throw new Error('Esta plaqueta já existe. Informe outro número.');
 if(!/^\d+$/.test(asset.tag)||!asset.name.trim()||asset.value<=0) throw new Error('Confira a plaqueta, o nome e o valor do bem.');
 return {...state,assets:[{...asset,history:[event('Cadastro','Bem incorporado ao patrimônio. Cadastro concluído.')],additions:[],attachments:[]},...state.assets]};
}
export function changeAsset(state:State,tag:string,kind:string,payload:Record<string,string|number>):State {
 const asset=state.assets.find(a=>a.tag===tag); if(!asset) throw new Error('Plaqueta não encontrada.');
 if(asset.status==='Baixado' && kind!=='Descrição' && kind!=='Anexo') throw new Error('Este bem foi baixado e não aceita novas movimentações.');
 let updated={...asset}; let description='';
 if(kind==='Descrição'){updated.description=String(payload['description']);description='Descrição complementar atualizada: '+updated.description;}
 if(kind==='Transferência'){
  const before=[asset.branch,asset.account,asset.center,asset.location,asset.responsible].join(' · ');
  updated={...updated,branch:String(payload['branch']),account:String(payload['account']),center:String(payload['center']),location:String(payload['location']),responsible:String(payload['responsible'])};
  description=`${dateBR(String(payload['date']))} — Origem: ${before}. Destino: ${[updated.branch,updated.account,updated.center,updated.location,updated.responsible].join(' · ')}.`;
 }
 if(kind==='Situação'){updated.status=String(payload['status']) as Status; description=`${asset.status} → ${updated.status} · ${payload['reason']} · ${payload['observation']}`;}
 if(kind==='Baixa'){updated.status='Baixado';description=`${payload['reason']} · Destino: ${payload['destination']} · ${payload['observation']}`;}
 if(kind==='Adição'){
  const value=Number(payload['value']);if(value<=0||!Number.isFinite(value))throw new Error('Informe um valor maior que zero.');
  updated.additions=[...asset.additions,{description:String(payload['description']),document:String(payload['document']),supplier:String(payload['supplier']),date:String(payload['date']),value}];updated.value+=value;updated.book+=value;description=`${payload['description']} · NF ${payload['document']} · ${money(value)}`;
 }
 if(kind==='Impairment'){const value=Number(payload['value']);if(!Number.isFinite(value)||value<0||value>=asset.book)throw new Error('Informe um valor menor que o valor contábil atual e maior ou igual a zero.'); updated.book=value;description=`Valor contábil ajustado de ${money(asset.book)} para ${money(value)}.`;}
 updated.history=[...asset.history,event(kind,description)];
 return {...state,assets:state.assets.map(a=>a.tag===tag?updated:a)};
}
export function depreciation(asset:Asset,reference='2026-10') {
 const residual=Math.min(asset.book,asset.value*asset.residual/100);const monthly=Math.max(0,(asset.book-residual)/60);
 const start=new Date(asset.start+'T12:00:00');const end=new Date(reference+'-01T12:00:00');
 const months=Math.min(60,Math.max(0,(end.getFullYear()-start.getFullYear())*12+end.getMonth()-start.getMonth()+1));
 return Array.from({length:months},(_,i)=>{const d=new Date(start);d.setMonth(start.getMonth()+i);return {period:`${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`,monthly,accumulated:monthly*(i+1),net:Math.max(residual,asset.book-monthly*(i+1)),residual};});
}
export function accounting(state:State,period:string,kind:'Cálculo'|'Contabilização'):State {
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(period))throw new Error('Informe uma competência válida no formato MM/AAAA.');
 const existing=state.periods.find(p=>p.period===period);
 if(existing?.posted)throw new Error('Esta competência já foi contabilizada.');
 if(kind==='Contabilização'&&!existing?.calculated)throw new Error('Calcule esta competência antes de contabilizar.');
 const considered=state.assets.filter(a=>a.status!=='Baixado'&&depreciation(a,period).length>0);
 const total=kind==='Contabilização'?(existing?.total??0):considered.reduce((s,a)=>s+(depreciation(a,period).at(-1)?.monthly??0),0);
 const record:Period={period,calculated:true,posted:kind==='Contabilização',calculatedAt:kind==='Cálculo'?new Date().toISOString():existing?.calculatedAt,postedAt:kind==='Contabilização'?new Date().toISOString():undefined,total,count:kind==='Contabilização'?(existing?.count??considered.length):considered.length};
 return {...state,periods:[...state.periods.filter(p=>p.period!==period),record],assets:state.assets.map(a=>a.status==='Baixado'?a:{...a,history:[...a.history,event(kind,`${kind==='Cálculo'?'Depreciação calculada':'Período contabilizado'} · ${period.split('-').reverse().join('/')}`)]})};
}
export const periodBR=(period:string)=>period.split('-').reverse().join('/');
export function parsePeriod(value:string):string|null{const m=/^(0[1-9]|1[0-2])\/(\d{4})$/.exec(value);return m?.[1]&&m[2]?`${m[2]}-${m[1]}`:null;}
export type AccountingStatus='Não iniciado'|'Em andamento'|'Concluído'|'Erro';
export function competence(state:State,period:string){
 const record=state.periods.find(p=>p.period===period);
 const stage=(kind:Processing['kind'])=>{const job=state.jobs.find(j=>j.period===period&&j.kind===kind);const done=kind==='Cálculo'?record?.calculated:record?.posted;const date=kind==='Cálculo'?record?.calculatedAt:record?.postedAt;const status:AccountingStatus=job?job.status==='Em processamento'?'Em andamento':job.status:done?'Concluído':'Não iniciado';return {status,date:job?(job.completedAt??(job.status==='Concluído'?date:job.date)):date};};
 return {period,calculation:stage('Cálculo'),posting:stage('Contabilização'),count:record?.count??(record?state.assets.filter(a=>a.status!=='Baixado'&&depreciation(a,period).length>0).length:0),total:record?.total??0,posted:record?.posted??false};
}
/** Detalhamento da competência: itens elegíveis, exclusões e composição do total. */
export function periodBreakdown(state:State,period:string){
 const lines=state.assets.flatMap(asset=>{
  if(asset.status==='Baixado')return [];
  const rows=depreciation(asset,period);
  if(!rows.length)return [];
  const last=rows.at(-1)!;
  const residual=Math.min(asset.book,asset.value*asset.residual/100);
  return [{tag:asset.tag,name:asset.name,status:asset.status,book:asset.book,residual,base:Math.max(0,asset.book-residual),monthly:last.monthly,accumulated:last.accumulated,net:last.net,months:rows.length}];
 });
 const excluded=state.assets.filter(a=>a.status==='Baixado'||depreciation(a,period).length===0).map(a=>({tag:a.tag,name:a.name,reason:a.status==='Baixado'?'Baixado':'Sem depreciação no período'}));
 const book=lines.reduce((s,l)=>s+l.book,0);
 const residual=lines.reduce((s,l)=>s+l.residual,0);
 const base=lines.reduce((s,l)=>s+l.base,0);
 const monthly=lines.reduce((s,l)=>s+l.monthly,0);
 const accumulated=lines.reduce((s,l)=>s+l.accumulated,0);
 const net=lines.reduce((s,l)=>s+l.net,0);
 return {lines,excluded,book,residual,base,monthly,accumulated,net};
}
export function startAccounting(state:State,period:string,kind:Processing['kind'],now=Date.now()):State{
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(period))throw new Error('Informe uma competência válida no formato MM/AAAA.');
 if(state.jobs.some(j=>j.period===period&&j.status==='Em processamento'))throw new Error('Aguarde a conclusão desta competência.');
 const summary=competence(state,period);
 if(summary.posted)throw new Error('Esta competência já foi contabilizada.');
 if(kind==='Contabilização'&&summary.calculation.status!=='Concluído')throw new Error('Calcule esta competência antes de contabilizar.');
 const job:Processing={id:'PROC-'+crypto.randomUUID(),period,kind,status:'Em processamento',date:new Date(now).toISOString(),due:now+1200,fail:false};
 return {...state,jobs:[job,...state.jobs]};
}
export function finishAccounting(state:State,now=Date.now()):State{
 let next=state;
 for(const job of state.jobs){if(job.status!=='Em processamento'||job.due>now)continue;let status:Processing['status']='Concluído';try{if(job.fail)throw new Error('Falha no processamento');next=accounting(next,job.period,job.kind);}catch{status='Erro';}next={...next,jobs:next.jobs.map(j=>j.id===job.id?{...j,status,completedAt:new Date(now).toISOString()}:j)};}
 return next;
}
export type FilterFacet='branch'|'location'|'responsible'|'center'|'species'|'account'|'status';
export const filterFacets:{key:FilterFacet;label:string}[]=[{key:'branch',label:'Filial'},{key:'location',label:'Localização'},{key:'responsible',label:'Responsável'},{key:'center',label:'Centro de custo'},{key:'species',label:'Espécie'},{key:'account',label:'Conta contábil'},{key:'status',label:'Situação'}];
export type AssetFilters={query:string;minValue:string;maxValue:string}&Record<FilterFacet,string[]>;
export const emptyFilters=():AssetFilters=>({query:'',minValue:'',maxValue:'',branch:[],location:[],responsible:[],center:[],species:[],account:[],status:[]});
const parseValue=(v:string)=>{const n=Number(v.replace(/\./g,'').replace(',','.'));return v.trim()&&Number.isFinite(n)?n:null;};
/** Filtros diferentes combinam com E; valores do mesmo filtro combinam com OU. Valor compara o contábil. */
export function filterAssets(assets:Asset[],f:AssetFilters):Asset[]{
 const q=f.query.trim().toLowerCase();const min=parseValue(f.minValue);const max=parseValue(f.maxValue);
 return assets.filter(a=>(!q||[a.tag,a.name,a.description,a.branch,a.location,a.responsible].join(' ').toLowerCase().includes(q))
  &&filterFacets.every(({key})=>!f[key].length||f[key].includes(String(a[key])))
  &&(min===null||a.book>=min)&&(max===null||a.book<=max));
}
export function activeFilterCount(f:AssetFilters){return filterFacets.reduce((n,{key})=>n+f[key].length,0)+(parseValue(f.minValue)!==null?1:0)+(parseValue(f.maxValue)!==null?1:0);}
/** Opções de um filtro com a contagem considerando os demais filtros ativos. */
export function facetOptions(assets:Asset[],f:AssetFilters,key:FilterFacet){
 const base=filterAssets(assets,{...f,[key]:[]});const values=[...new Set([...assets.map(a=>String(a[key])),...f[key]])].sort((x,y)=>x.localeCompare(y,'pt-BR'));
 return values.map(value=>({value,count:base.filter(a=>String(a[key])===value).length}));
}
/** Extrai a plaqueta de um texto lido no QR Code. Não completa zeros. */
export function parseTag(text:string):string|null{const m=/plaqueta\D*(\d+)/i.exec(text);if(m?.[1])return m[1];const t=text.trim();return /^\d+$/.test(t)?t:null;}
export function attachTo(state:State,tag:string,att:Attachment,description:string):State{if(!state.assets.some(a=>a.tag===tag))throw new Error('Plaqueta não encontrada.');return {...state,assets:state.assets.map(a=>a.tag===tag?{...a,attachments:[...a.attachments,att],history:[...a.history,event('Anexo',description)]}:a)};}
