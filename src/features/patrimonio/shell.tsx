"use client";

import { Link, useLocation, useNavigate } from "@/lib/navigation";
import {
  Package,
  ArrowLeftRight,
  Calculator,
  Layers,
  LogOut,
  ArrowLeft,
  QrCode,
  CircleHelp,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { labels } from "./domain";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type Sub = { label: string; to: string; hash?: string; search?: { lista: string } };
export type ModuleCategory = "gestao" | "admin";

export const modules: {
  to: string;
  label: string;
  homeLabel: string;
  category: ModuleCategory;
  categoryLabel: string;
  icon: typeof Package;
  iconAsset: string;
  desc: string;
  homeDesc: string;
  pages: Sub[];
}[] = [
  {
    to: "/patrimonios",
    label: "Patrimônios",
    homeLabel: "Patrimônios",
    category: "gestao",
    categoryLabel: "Gestão de bens",
    icon: Package,
    iconAsset: "18c47.svg",
    desc: "Consulte, cadastre e acompanhe os bens pela plaqueta.",
    homeDesc: "Todos os seus bens, em um só lugar. Consulte, cadastre e acompanhe cada patrimônio.",
    pages: [
      { label: "Lista de bens", to: "/patrimonios" },
      { label: "Novo bem", to: "/patrimonios/novo" },
      { label: "Gerar plaqueta", to: "/patrimonios/plaqueta" },
    ],
  },
  {
    to: "/movimentacao",
    label: "Movimentação",
    homeLabel: "Movimentação",
    category: "gestao",
    categoryLabel: "Operações",
    icon: ArrowLeftRight,
    iconAsset: "e5913.svg",
    desc: "Transfira um bem ou vários de uma vez.",
    homeDesc: "Transfira um bem ou vários de uma vez, com agilidade e rastreabilidade.",
    pages: [
      { label: "Transferir um bem", to: "/movimentacao/transferir" },
      { label: "Transferência em lote", to: "/movimentacao/lote" },
      { label: "Histórico", to: "/movimentacao/lote", hash: "historico" },
    ],
  },
  {
    to: "/contabilizacao",
    label: "Contabilização",
    homeLabel: "Contabilização",
    category: "admin",
    categoryLabel: "Financeiro",
    icon: Calculator,
    iconAsset: "2758c.svg",
    desc: "Calcule e contabilize a competência.",
    homeDesc: "Calcule a depreciação e gerencie a contabilização por competência.",
    pages: [
      { label: "Calcular", to: "/contabilizacao" },
      { label: "Contabilizar", to: "/contabilizacao", hash: "contabilizar" },
      { label: "Competências", to: "/contabilizacao", hash: "competencias" },
    ],
  },
  {
    to: "/ler-qr",
    label: "Ler QR Code",
    homeLabel: "Ler QR Code",
    category: "gestao",
    categoryLabel: "Identificação",
    icon: QrCode,
    iconAsset: "d5849.svg",
    desc: "Aponte a câmera ou envie uma foto do QR da plaqueta para abrir o bem.",
    homeDesc: "Encontre a ficha de um bem usando a câmera ou uma foto da plaqueta.",
    pages: [{ label: "Ler QR Code", to: "/ler-qr" }],
  },
  {
    to: "/cadastros",
    label: "Cadastros auxiliares",
    homeLabel: "Cadastros auxiliares",
    category: "admin",
    categoryLabel: "Configurações",
    icon: Layers,
    iconAsset: "0ab4a.svg",
    desc: "Filiais, contas, pessoas, fornecedores e demais listas.",
    homeDesc: "Organize filiais, responsáveis, localizações e os dados da sua operação.",
    pages: Object.entries(labels).map(([k, l]) => ({
      label: l,
      to: "/cadastros",
      search: { lista: k },
    })),
  },
];

export const AUTH_KEY = "mutua-patrimonio-auth";

const titles: Record<string, string> = {
  "/patrimonios": "Patrimônios",
  "/patrimonios/novo": "Cadastrar patrimônio",
  "/patrimonios/plaqueta": "Gerar plaqueta",
  "/movimentacao": "Movimentação",
  "/movimentacao/transferir": "Movimentação",
  "/movimentacao/lote": "Transferência em lote",
  "/contabilizacao": "Contabilização",
  "/cadastros": "Cadastros auxiliares",
  "/ler-qr": "Ler QR Code",
};

export function crumbTitle(pathname: string) {
  if (pathname.startsWith("/patrimonios/") && pathname !== "/patrimonios/novo" && pathname !== "/patrimonios/plaqueta") {
    return "Ficha do patrimônio";
  }
  return titles[pathname] ?? "Gestão de Patrimônio";
}

export function UserMenu({ showLabel = false }: { showLabel?: boolean }) {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="user-menu-top" aria-label="Usuário — opções da conta">
          <span className="avatar">U</span>
          {showLabel && (
            <span className="user-info">
              <strong>Usuário</strong>
              <small>Área do usuário</small>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="user-menu">
        <DropdownMenuLabel>Conta do usuário</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="logout-item"
          onSelect={() => {
            try {
              sessionStorage.removeItem(AUTH_KEY);
            } catch {
              /* sem sessão */
            }
            void navigate({ to: "/login", replace: true });
          }}
        >
          <LogOut />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === "/";
  const [help, setHelp] = useState(false);
  const back = () => void navigate({ to: "/" });

  return (
    <div className={`app-shell${isHome ? " app-shell-home" : " app-shell-workspace"}`}>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="topbar-brand" aria-label="Mútua — início">
            <img
              src="/assets/778f5.png"
              width={192}
              height={54}
              decoding="async"
              alt="Mútua — Caixa de Assistência dos Profissionais do CREA"
              className="topbar-logo"
            />
            <span className="topbar-divider" aria-hidden />
            <span className="topbar-product">
              Gestão de
              <strong>Patrimônio</strong>
            </span>
          </Link>
          <div className="topbar-actions">
            {isHome && (
              <Button
                variant="ghost"
                size="icon"
                className="topbar-help"
                aria-label="Abrir ajuda"
                aria-expanded={help}
                onClick={() => setHelp((v) => !v)}
              >
                <CircleHelp size={20} />
              </Button>
            )}
            {!isHome && <span className="topbar-demo">Ambiente de demonstração</span>}
            <UserMenu showLabel={isHome} />
          </div>
        </div>
      </header>

      <main className="main-content">
        {!isHome && (
          <div className="workspace-trail">
            <nav className="workspace-crumb" aria-label="Breadcrumb">
              <Link to="/" className="workspace-crumb-link">
                Início
              </Link>
              <span className="workspace-crumb-sep" aria-hidden>
                /
              </span>
              <span className="workspace-crumb-current">{crumbTitle(pathname)}</span>
            </nav>
            <button type="button" className="workspace-back-inline" onClick={back}>
              <ArrowLeft size={16} aria-hidden />
              Voltar ao início
            </button>
          </div>
        )}
        {isHome && help && (
          <aside className="home-help" role="note">
            <strong>Como podemos ajudar?</strong>
            <p>
              Selecione um serviço para acessar suas funções. Em Patrimônios você consulta os bens; em
              Movimentação, transfere; em Contabilização, gerencia competências. Em Ler QR Code, abra a
              ficha pela plaqueta. Cadastros auxiliares mantém as listas da operação.
            </p>
          </aside>
        )}
        {children}
      </main>
    </div>
  );
}
