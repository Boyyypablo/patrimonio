"use client";
import {Link,useLocation,useNavigate} from '@/lib/navigation';
import {Package,ArrowLeftRight,Calculator,Layers,ChevronDown,LogOut,ArrowLeft,QrCode} from 'lucide-react';
import {type ReactNode} from 'react';
import {Button} from '@/components/ui/button';
import {labels} from './domain';
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuLabel,DropdownMenuSeparator,DropdownMenuItem} from '@/components/ui/dropdown-menu';
type Sub={label:string;to:string;hash?:string;search?:{lista:string}};
export const modules:{to:string;label:string;icon:typeof Package;desc:string;pages:Sub[]}[]=[
{to:'/patrimonios',label:'Patrimônios',icon:Package,desc:'Consulte, cadastre e acompanhe os bens pela plaqueta.',pages:[{label:'Lista de bens',to:'/patrimonios'},{label:'Novo bem',to:'/patrimonios/novo'}]},
{to:'/movimentacao',label:'Movimentação em lote',icon:ArrowLeftRight,desc:'Transfira vários bens de uma vez.',pages:[{label:'Nova transferência',to:'/movimentacao'},{label:'Histórico',to:'/movimentacao',hash:'historico'}]},
{to:'/contabilizacao',label:'Contabilização',icon:Calculator,desc:'Calcule e contabilize a competência.',pages:[{label:'Calcular',to:'/contabilizacao'},{label:'Contabilizar',to:'/contabilizacao',hash:'contabilizar'},{label:'Competências',to:'/contabilizacao',hash:'competencias'}]},
{to:'/ler-qr',label:'Ler QR Code',icon:QrCode,desc:'Aponte a câmera ou envie uma foto do QR da plaqueta para abrir o bem.',pages:[{label:'Ler QR Code',to:'/ler-qr'}]},
{to:'/cadastros',label:'Cadastros auxiliares',icon:Layers,desc:'Filiais, contas, pessoas, fornecedores e demais listas.',pages:Object.entries(labels).map(([k,l])=>({label:l,to:'/cadastros',search:{lista:k}}))}];
export const AUTH_KEY='mutua-patrimonio-auth';
export function UserMenu(){const navigate=useNavigate();return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="user-menu-top" aria-label="Menu do usuário"><span className="avatar">M</span><span className="user-info"><strong>Usuário</strong></span><ChevronDown size={13}/></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="user-menu"><DropdownMenuLabel>Usuário · Mútua</DropdownMenuLabel><DropdownMenuSeparator/><DropdownMenuItem className="logout-item" onSelect={()=>{try{sessionStorage.removeItem(AUTH_KEY);}catch{/* sem sessão */}void navigate({to:"/login",replace:true});}}><LogOut/>Sair</DropdownMenuItem></DropdownMenuContent></DropdownMenu>;}
export function AppShell({children}:{children:ReactNode}){const {pathname}=useLocation();const navigate=useNavigate();const back=()=>void navigate({to:'/'});
 return <div className="app-shell"><header className="topbar"><Link to="/" className="topbar-logo-button" aria-label="Ir para a página inicial"><img src="/brand/mutua-logo.png" width={148} height={42} decoding="async" alt="Mútua — Caixa de Assistência dos Profissionais do CREA" className="topbar-logo"/></Link><UserMenu/></header><main className="main-content">{pathname!=='/'&&<Button variant="ghost" className="back-link no-print" onClick={back}><ArrowLeft size={16}/> Voltar</Button>}{children}</main></div>;}
