"use client";
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {initialState,finishAccounting,type State} from './domain';
import {toast} from 'sonner';
type Store = {state:State; ready:boolean; update:(fn:(s:State)=>State,message?:string)=>boolean};
const Context=createContext<Store|null>(null);
const KEY='mutua-patrimonio-demo-v1';
const legacyKey=()=>{try{return Object.keys(sessionStorage).find(k=>k.endsWith('-demo-v1')&&k!==KEY);}catch{return undefined;}};
export function PatrimonioProvider({children}:{children:ReactNode}){
 const [state,setState]=useState<State>(initialState);const [ready,setReady]=useState(false);
 useEffect(()=>{try{const old=legacyKey();const data=sessionStorage.getItem(KEY)??(old?sessionStorage.getItem(old):null);if(data){const saved=JSON.parse(data);if(Array.isArray(saved.assets)&&saved.domains&&Array.isArray(saved.jobs)&&Array.isArray(saved.periods)){setState(saved);if(old)sessionStorage.setItem(KEY,data);}}}catch{toast.error('Não foi possível recuperar a sessão. A sessão foi reiniciada.');}setReady(true);},[]);
 useEffect(()=>{if(!ready||!state.jobs.some(j=>j.status==='Em processamento'))return;const timer=setInterval(()=>{const next=finishAccounting(state);if(next===state)return;try{sessionStorage.setItem(KEY,JSON.stringify(next));setState(next);}catch{toast.error('Não foi possível salvar o resultado do processamento.');}},300);return ()=>clearInterval(timer);},[state,ready]);
 const update:Store['update']=(fn,message)=>{try{const next=fn(state);sessionStorage.setItem(KEY,JSON.stringify(next));setState(next);if(message)toast.success(message);return true;}catch(e){toast.error(e instanceof Error?e.message:'Não foi possível salvar. O armazenamento da sessão pode estar cheio.');return false;}};
 return <Context.Provider value={{state,ready,update}}>{children}</Context.Provider>;
}
export function usePatrimonio(){const ctx=useContext(Context);if(!ctx)throw new Error('PatrimonioProvider obrigatório');return ctx;}
