# Gestão de Patrimônio Mútua

Protótipo front-end (Next.js 15 + React 19) para consultar, cadastrar, movimentar e contabilizar bens patrimoniais da Mútua.

> **Status: protótipo.** Não há backend. Os dados, o login e o processamento são simulados no navegador para validar fluxos e layout. Regras de negócio, persistência, autenticação e cálculo oficial serão definidos na integração com o backend.

## Scripts

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # testes de domínio (node --test)
npm run build
```

## Como o protótipo funciona

- **Dados:** carregados de uma base de demonstração (`initialState` em `src/features/patrimonio/domain.ts`) e salvos no `sessionStorage` (chave `mutua-patrimonio-demo-v1`). Fechar a aba reinicia a demonstração.
- **Login:** qualquer e-mail válido e senha preenchida entram. As rotas internas não exigem login.
- **Contabilização:** cálculo e contabilização são jobs simulados (~1,2 s). A depreciação é uma projeção linear de 60 meses: `(contábil − residual) ÷ 60`. Ela não altera o valor contábil dos bens.
- **Anexos e plaquetas:** gravados em base64 na sessão (limite de 1 MB por arquivo).
- **Layout:** mobile-first; desktop é a segunda prioridade.

## Rotas

| Rota | Tela |
|------|------|
| `/login` | Acesso |
| `/` | Home com os módulos |
| `/patrimonios` | Lista de bens (filtros, paginação, menu Plaqueta) |
| `/patrimonios/novo` | Cadastro em 3 etapas |
| `/patrimonios/[tag]` | Ficha do bem (8 abas; `?aba=` abre uma aba) |
| `/patrimonios/plaqueta` | Gerar etiqueta com QR Code (`?tag=`) |
| `/movimentacao` | Redireciona para `/movimentacao/transferir` |
| `/movimentacao/transferir` | Transferir um bem (`?tag=`) |
| `/movimentacao/lote` | Transferência em lote |
| `/contabilizacao` | Cálculo e contabilização por competência |
| `/cadastros` | Listas auxiliares (`?lista=`) |
| `/ler-qr` | Ler QR Code da plaqueta (câmera ou foto) |

## Estrutura

```text
app/                         rotas (App Router) e globals.css
src/components/              providers e componentes de UI (Radix + Tailwind)
src/features/patrimonio/
  domain.ts                  tipos, dados de demonstração e regras
  store.tsx                  estado da sessão (sessionStorage)
  shell.tsx                  cabeçalho, trilha e menu do usuário
  *-page.tsx                 telas
src/lib/                     navegação e helpers
public/brand/                identidade visual: mutua-logo.png (logo) e mutua-emblema.png (emblema, origem do favicon)
public/favicon.png           favicon (emblema sem fundo, 128×128)
Patrimonio - figma/          export do Figma Make usado como referência visual
MAPA-PROJETO.md              inventário de telas e fluxos (diagramas para o FigJam)
```

## Itens previstos para a integração com o backend

O protótipo deixa de lado de propósito o que depende do backend:

- autenticação real e proteção das rotas;
- persistência, concorrência e anexos em armazenamento de arquivos;
- cálculo oficial de depreciação e efeito da contabilização sobre o valor contábil;
- histórico persistente dos lotes de transferência;
- integridade entre cadastros auxiliares e bens, com IDs gerados pelo servidor.
