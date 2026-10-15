"use client";
import {useState} from 'react';
import {Calculator,CheckCircle2,Clock,RefreshCw,FileCheck2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {usePatrimonio} from './store';
import {competence,startAccounting,money,dateBR,parsePeriod,periodBR,type AccountingStatus} from './domain';
import {PageHeading,Field,StatusBadge} from './shared';

function Stage({label,status,date}:{label:string;status:AccountingStatus;date:string|undefined}){return <div className="competence-stage"><span>{label}</span><StatusBadge status={status}/><small>{date?dateBR(date):'Sem registro'}</small></div>;}

export function AccountingPage(){
 const {state,update}=usePatrimonio();
 const [reference,setReference]=useState('10/2026');
 const [period,setPeriod]=useState('2026-10');
 const [error,setError]=useState('');
 const summary=competence(state,period);
 const pending=summary.calculation.status==='Em andamento'||summary.posting.status==='Em andamento';
 const periods=[...new Set([period,...state.periods.map(p=>p.period),...state.jobs.map(j=>j.period)])].sort((a,b)=>b.localeCompare(a));
 function consult(){const value=parsePeriod(reference);if(!value){setError('Informe o mês e o ano no formato MM/AAAA, por exemplo 10/2026.');return;}setError('');setPeriod(value);}
 function select(value:string){setPeriod(value);setReference(periodBR(value));setError('');}
 function run(kind:'Cálculo'|'Contabilização'){if(parsePeriod(reference)!==period){setError('Consulte a competência informada antes de iniciar.');return;}setError('');update(s=>startAccounting(s,period,kind),kind==='Cálculo'?'Cálculo iniciado.':'Contabilização iniciada.');}
 return <><PageHeading title="Contabilização" description="Consulte o mês, calcule a depreciação e contabilize a competência."/>
 <div className="accounting-layout"><section><div className="section-heading"><h2>Competência do período</h2><span>MM/AAAA</span></div>
 <form className="competence-search" onSubmit={e=>{e.preventDefault();consult();}}><Field label="Mês e ano de referência *"><Input inputMode="numeric" maxLength={7} placeholder="10/2026" value={reference} onChange={e=>{const digits=e.target.value.replace(/\D/g,'').slice(0,6);setReference(digits.length>2?digits.slice(0,2)+'/'+digits.slice(2):digits);setError('');}}/></Field><Button type="submit" variant="outline">Consultar</Button></form>
 {error&&<p role="alert" className="text-sm text-destructive mb-4">{error}</p>}
 <div className="accounting-steps"><div className={`accounting-step ${summary.calculation.status==='Concluído'?'accounting-done':''}`}><span className="accounting-step-icon"><Calculator size={24}/></span><div><small>ETAPA 1 · {periodBR(period)}</small><h3>Calcular o período</h3><p>Calcula a depreciação dos bens para o mês consultado.</p><StatusBadge status={summary.calculation.status}/></div><Button disabled={pending||summary.posted} onClick={()=>run('Cálculo')}>{summary.calculation.status==='Concluído'?<RefreshCw size={16}/>:<Calculator size={16}/>} {summary.calculation.status==='Erro'?'Tentar cálculo novamente':summary.calculation.status==='Concluído'?'Recalcular':'Calcular'}</Button></div>
 <div id="contabilizar" className={`accounting-step ${summary.posted?'accounting-done':''}`}><span className="accounting-step-icon"><FileCheck2 size={24}/></span><div><small>ETAPA 2 · {periodBR(period)}</small><h3>Contabilizar a competência</h3><p>Efetiva o resultado após o cálculo do período.</p><StatusBadge status={summary.posting.status}/></div><Button disabled={summary.calculation.status!=='Concluído'||pending||summary.posted} onClick={()=>run('Contabilização')}><CheckCircle2 size={16}/> {summary.posting.status==='Erro'?'Tentar contabilizar novamente':'Contabilizar'}</Button></div></div>
 <div className="notice mt-5"><Clock size={17}/><span>A contabilização só fica disponível após o cálculo. Sem envio para sistemas contábeis.</span></div></section>
 <aside className="period-summary"><div className="section-heading"><h2>Resumo do período</h2><span>{periodBR(period)}</span></div><div className="period-total"><span>Total da depreciação</span><strong>{money(summary.total)}</strong></div><dl className="period-details"><div><dt>Bens considerados</dt><dd>{summary.count}</dd></div><div><dt>Data do cálculo</dt><dd>{summary.calculation.date?dateBR(summary.calculation.date):'Não iniciado'}</dd></div><div><dt>Data da contabilização</dt><dd>{summary.posting.date?dateBR(summary.posting.date):'Não iniciado'}</dd></div></dl></aside></div>
 <section id="competencias" className="mt-9"><div className="section-heading"><h2>Lista de competências</h2><span>{periods.length} {periods.length===1?'competência':'competências'}</span></div><div className="competence-list">{periods.map(value=>{const row=competence(state,value);return <article className={`competence-row ${value===period?'competence-selected':''}`} key={value} aria-label={`Competência ${periodBR(value)}`}><Button variant="link" onClick={()=>select(value)} aria-label={`Consultar competência ${periodBR(value)}`}>{periodBR(value)}</Button><Stage label="Cálculo" status={row.calculation.status} date={row.calculation.date}/><Stage label="Contabilização" status={row.posting.status} date={row.posting.date}/><div className="competence-amount"><span>Total da depreciação</span><strong>{money(row.total)}</strong><small>{row.count} bens considerados</small></div></article>;})}</div></section></>;
}
