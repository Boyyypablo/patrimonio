# Fluxos de Paginas — Gestao de Patrimonio Mutua

Documento otimizado para o Figma MCP (`generate_diagram` / FigJam).
Cada bloco Mermaid abaixo pode ser colado ou enviado direto ao plugin para gerar o diagrama editavel.

## Como usar no Figma

1. Pedir ao Cursor: "gere este diagrama no FigJam" apontando um bloco `mermaid` abaixo.
2. Ou usar `/figma-generate-diagram` com o conteudo do bloco.
3. Preferir **um diagrama por secao** (nao juntar tudo em um so) — o layout do FigJam fica legivel.
4. Regras do Mermaid no FigJam:
   - sem emojis
   - IDs em camelCase
   - labels com caracteres especiais entre aspas
   - nao usar `end`, `subgraph` ou `graph` como ID de no
   - direcionamento unico por diagrama (`LR` ou `TD`)

## Inventario de telas (todas)

Use esta lista ao criar frames de UI no Figma Design. Cada linha = 1 tela/frame.

| ID | Rota | Nome do frame | Tipo |
|----|------|---------------|------|
| login | `/login` | Login | pagina |
| home | `/` | Home - Modulos | pagina |
| patrimList | `/patrimonios` | Patrimonios - Lista | pagina |
| patrimNovo | `/patrimonios/novo` | Patrimonios - Novo bem | pagina |
| patrimFicha | `/patrimonios/:tag` | Patrimonios - Ficha | pagina |
| patrimPlaqueta | `/patrimonios/plaqueta` | Patrimonios - Gerar plaqueta | pagina |
| movLote | `/movimentacao` | Movimentacao - Lote | pagina |
| movUm | `/movimentacao/transferir` | Movimentacao - Transferir um bem | pagina |
| contab | `/contabilizacao` | Contabilizacao | pagina |
| cadastros | `/cadastros` | Cadastros auxiliares | pagina |
| lerQr | `/ler-qr` | Ler QR Code | pagina |
| notFound | `not-found` | Pagina nao encontrada | sistema |
| errorPage | `error` | Erro da aplicacao | sistema |

### Telas internas (modais / estados da mesma rota)

| ID | Onde aparece | Nome do frame |
|----|--------------|---------------|
| fichaTabDados | Ficha | Ficha - Aba Dados do bem |
| fichaTabTransf | Ficha | Ficha - Aba Transferencias |
| fichaTabSituacao | Ficha | Ficha - Aba Situacao e baixas |
| fichaTabAdicoes | Ficha | Ficha - Aba Adicoes |
| fichaTabImpairment | Ficha | Ficha - Aba Impairment |
| fichaTabDepreciacao | Ficha | Ficha - Aba Depreciacao |
| fichaTabAnexos | Ficha | Ficha - Aba Anexos |
| fichaTabHistorico | Ficha | Ficha - Aba Historico |
| modalDescricao | Ficha | Modal - Editar descricao |
| modalTransf | Ficha | Modal - Transferir patrimonio |
| modalSituacao | Ficha | Modal - Alterar situacao |
| modalBaixa | Ficha | Modal - Registrar baixa |
| modalAdicao | Ficha | Modal - Incorporar adicao |
| modalImpairment | Ficha | Modal - Registrar impairment |
| modalConfirmBaixa | Ficha | Modal - Confirmar baixa |
| modalConfirmImp | Ficha | Modal - Confirmar impairment |
| modalPreviewAnexo | Ficha | Modal - Preview de anexo |
| dialogQrCamera | Lista / shell | Dialog - Ler QR (camera) |
| dialogQrFoto | Lista / shell | Dialog - Enviar foto do QR |
| loteReview | Movimentacao lote | Dialog - Confirmar lote |
| loteResultado | Movimentacao lote | Secao - Resultado do lote |
| novoStep1 | Novo bem | Wizard - Etapa Geral |
| novoStep2 | Novo bem | Wizard - Etapa Aquisicao |
| novoStep3 | Novo bem | Wizard - Etapa Localizacao |
| contabCalc | Contabilizacao | Secao - Calcular periodo |
| contabPost | Contabilizacao | Secao - Contabilizar |
| contabLista | Contabilizacao | Secao - Lista de competencias |
| cadDomain | Cadastros | Lista do dominio selecionado |
| cadCreate | Cadastros | Modal - Incluir / editar item |
| cadDelete | Cadastros | Modal - Excluir item |

---

## DIAGRAMA 01 — Mapa mestre de paginas (todas as rotas)

Copiar este bloco para o FigJam. Cobre login, home e todas as paginas subsequentes.

```mermaid
flowchart TD
  login(["Login /login"])
  home(["Home /"])
  patrimList["Patrimonios /patrimonios"]
  patrimNovo["Novo bem /patrimonios/novo"]
  patrimFicha["Ficha /patrimonios/:tag"]
  patrimPlaqueta["Gerar plaqueta /patrimonios/plaqueta"]
  movLote["Movimentacao lote /movimentacao"]
  movUm["Transferir um bem /movimentacao/transferir"]
  contab["Contabilizacao /contabilizacao"]
  cadastros["Cadastros /cadastros"]
  lerQr["Ler QR /ler-qr"]

  login ==>|"auth OK"| home
  home -->|"Sair"| login

  home ==> patrimList
  home ==> movLote
  home ==> contab
  home ==> lerQr
  home ==> cadastros

  patrimList --> patrimNovo
  patrimList --> patrimFicha
  patrimList --> patrimPlaqueta
  patrimList -.-> lerQr

  patrimNovo -->|"sucesso"| patrimFicha
  patrimNovo -.->|"toast Gerar plaqueta"| patrimPlaqueta

  patrimFicha --> movUm
  patrimFicha --> patrimPlaqueta

  movLote --> movUm
  movUm -->|"sucesso"| patrimFicha

  lerQr -->|"tag valida"| patrimFicha
  patrimPlaqueta -.->|"anexa QR"| patrimFicha

  home -->|"Voltar / Logo"| home
```

---

## DIAGRAMA 02 — Autenticacao e shell

```mermaid
flowchart LR
  start(["Abrir app"]) --> login(["Login"])
  login -->|"ja autenticado"| home(["Home"])
  login -->|"email + senha validos"| saveAuth{{"Grava sessionStorage"}}
  saveAuth --> home
  login -->|"invalido"| login
  home --> userMenu["Menu usuario"]
  userMenu -->|"Sair"| clearAuth{{"Remove auth"}}
  clearAuth --> login
  anyPage["Qualquer pagina com shell"] -->|"Voltar"| home
  anyPage -->|"Logo Mutua"| home
```

---

## DIAGRAMA 03 — Modulo Patrimonios (lista + subsequentes)

```mermaid
flowchart TD
  home(["Home"]) --> patrimList["Lista de bens"]
  patrimList --> filtros["Filtros: busca filial situacao"]
  filtros --> tabela["Tabela paginada"]

  tabela -->|"abrir linha"| patrimFicha["Ficha do bem"]
  tabela -->|"Novo patrimonio"| patrimonioNovo["Novo bem wizard"]
  tabela -->|"menu Plaqueta"| menuPlq["Menu Plaqueta"]

  menuPlq --> dialogCam["Dialog camera QR"]
  menuPlq --> dialogFoto["Dialog foto QR"]
  menuPlq --> patrimPlaqueta["Gerar plaqueta"]

  dialogCam -->|"tag valida"| patrimFicha
  dialogFoto -->|"tag valida"| patrimFicha

  patrimonioNovo --> step1["Etapa 1 Geral"]
  step1 --> step2["Etapa 2 Aquisicao"]
  step2 --> step3["Etapa 3 Localizacao"]
  step3 -->|"salvar"| patrimFicha
  step3 -.->|"atalho toast"| patrimPlaqueta

  patrimPlaqueta -->|"busca tag"| labelPreview["Preview etiqueta QR"]
  labelPreview -->|"download + anexa"| patrimFicha
```

---

## DIAGRAMA 04 — Ficha do bem (abas e modais)

Todas as subsequentes da ficha, sem ficar so na pagina inicial do bem.

```mermaid
flowchart TD
  entry(["Entrada /patrimonios/:tag"]) --> overview["Overview filial localizacao responsavel valor"]
  overview --> tabs{"Aba selecionada"}

  tabs -->|"Dados do bem"| tabDados["Aba Dados"]
  tabs -->|"Transferencias"| tabTransf["Aba Transferencias"]
  tabs -->|"Situacao e baixas"| tabSit["Aba Situacao e baixas"]
  tabs -->|"Adicoes"| tabAdd["Aba Adicoes"]
  tabs -->|"Impairment"| tabImp["Aba Impairment"]
  tabs -->|"Depreciacao"| tabDep["Aba Depreciacao"]
  tabs -->|"Anexos"| tabAnx["Aba Anexos"]
  tabs -->|"Historico"| tabHist["Aba Historico"]

  tabDados --> modalDesc["Modal Editar descricao"]
  tabTransf --> modalTr["Modal Nova transferencia"]
  tabTransf -->|"botao Transferir header"| pageTr["Pagina /movimentacao/transferir"]
  tabSit --> modalSit["Modal Alterar situacao"]
  tabSit --> modalBaixa["Modal Registrar baixa"]
  tabAdd --> modalAdd["Modal Nova adicao"]
  tabImp --> modalImp["Modal Impairment"]
  tabAnx --> upload["Anexar PDF JPG PNG"]
  tabAnx --> preview["Modal Preview anexo"]

  modalBaixa --> confirmBaixa{"Confirmar baixa?"}
  confirmBaixa -->|"sim"| savedBaixa["Status Baixado"]
  modalImp --> confirmImp{"Confirmar impairment?"}
  confirmImp -->|"sim"| savedImp["Valor contabil atualizado"]

  overview -->|"Gerar plaqueta"| pagePlq["Pagina Gerar plaqueta"]
  overview -->|"Registrar baixa"| modalBaixa

  savedBaixa --x blocked["Bloqueia transferencia adicao impairment"]
```

---

## DIAGRAMA 05 — Movimentacao (lote + um bem)

```mermaid
flowchart TD
  home(["Home"]) --> movLote["Movimentacao em lote"]
  movLote --> nav{"Acao"}

  nav -->|"Nova transferencia"| pickMode{"Modo de selecao"}
  nav -->|"Historico"| hist["Secao Resultado do lote"]
  nav -->|"Transferir um bem"| movUm["Pagina Transferir um bem"]

  pickMode -->|"Selecao"| selTable["Tabela com checkboxes"]
  pickMode -->|"Lista"| selList["Textarea de plaquetas"]
  pickMode -->|"Intervalo"| selRange["Plaqueta inicial e final"]

  selTable --> dest["Formulario destino comum"]
  selList --> dest
  selRange --> dest

  dest --> review["Dialog Revisar lote"]
  review -->|"confirmar"| results["Resultado por plaqueta"]
  results --> hist

  movUm --> searchTag["Buscar plaqueta"]
  searchTag --> formOne["Formulario destino"]
  formOne -->|"confirmar"| ficha["Ficha ?aba=Transferencias"]

  fichaEntry(["Ficha do bem"]) -->|"Transferir"| movUm
```

---

## DIAGRAMA 06 — Contabilizacao (etapas subsequentes)

```mermaid
flowchart TD
  home(["Home"]) --> contab["Contabilizacao"]
  contab --> inputPeriod["Informar competencia MM/AAAA"]
  inputPeriod -->|"Consultar"| summary["Resumo do periodo"]

  summary --> step1["Etapa 1 Calcular"]
  step1 -->|"job ~1.2s"| calcDone{"Calculo concluido?"}
  calcDone -->|"sim"| step2["Etapa 2 Contabilizar"]
  calcDone -->|"erro"| step1
  step2 -->|"job ~1.2s"| postDone{"Contabilizado?"}
  postDone -->|"sim"| locked["Competencia fechada"]
  postDone -->|"erro"| step2

  summary --> lista["Lista de competencias"]
  lista -->|"selecionar outra"| inputPeriod
  contab -.->|"ancora"| step2
  contab -.->|"ancora"| lista
```

---

## DIAGRAMA 07 — Cadastros auxiliares (todas as listas)

```mermaid
flowchart TD
  home(["Home"]) --> cad["Cadastros auxiliares"]
  cad --> domain{"lista query param"}

  domain -->|"filiais"| dFiliais["Lista Filiais"]
  domain -->|"contas"| dContas["Lista Contas contabeis"]
  domain -->|"centros"| dCentros["Lista Centros de custo"]
  domain -->|"pessoas"| dPessoas["Lista Pessoas"]
  domain -->|"especies"| dEspecies["Lista Especies"]
  domain -->|"fornecedores"| dForn["Lista Fornecedores"]
  domain -->|"localizacoes"| dLoc["Lista Localizacoes"]
  domain -->|"motivos"| dMotivos["Lista Motivos de baixa"]
  domain -->|"destinos"| dDestinos["Lista Destinos de baixa"]

  dFiliais & dContas & dCentros & dPessoas & dEspecies & dForn & dLoc & dMotivos & dDestinos --> crud["Buscar Incluir Editar Excluir"]
  crud --> modalEdit["Modal criar/editar"]
  crud --> modalDel["Modal confirmar exclusao"]
```

---

## DIAGRAMA 08 — QR Code e plaqueta (entradas alternativas)

```mermaid
flowchart LR
  home(["Home"]) --> lerQr["Ler QR /ler-qr"]
  listPage["Lista patrimonios"] --> menu["Menu Plaqueta"]
  ficha["Ficha do bem"] --> gerar["Gerar plaqueta"]
  novo["Novo bem toast"] -.-> gerar

  menu --> cam["Camera"]
  menu --> foto["Foto"]
  menu --> gerar
  lerQr --> cam
  lerQr --> foto

  cam --> parse{"parseTag"}
  foto --> parse
  parse -->|"valida e existe"| fichaOk["Ficha /patrimonios/:tag"]
  parse -->|"invalida"| erro(["Toast erro"])

  gerar --> busca["Informar numero plaqueta"]
  busca --> preview["Preview etiqueta"]
  preview -->|"salvar PNG"| fichaOk
```

---

## DIAGRAMA 09 — Jornada usuario completa (critica)

Caminho feliz do login ate as principais subsequentes.

```mermaid
flowchart LR
  login(["Login"]) ==> home(["Home"])
  home ==> lista["Lista patrimonios"]
  lista ==> ficha["Ficha"]
  ficha ==> transf["Transferir um bem"]
  transf ==> ficha2["Ficha aba Transferencias"]
  lista ==> novo["Novo bem"]
  novo ==> ficha3["Ficha do novo"]
  ficha3 ==> plaqueta["Gerar plaqueta"]
  home ==> lote["Movimentacao lote"]
  lote ==> resultado["Resultado lote"]
  home ==> contab["Contabilizacao"]
  contab ==> calc["Calcular"]
  calc ==> post["Contabilizar"]
  home ==> qr["Ler QR"]
  qr ==> ficha
  home ==> cad["Cadastros"]
```

---

## Prompt pronto para o Cursor / Figma

Cole isto no chat quando quiser gerar os fluxos no FigJam:

```
Use o MAPA-PROJETO.md e gere no FigJam (generate_diagram) os diagramas 01 a 09,
cada um em um diagrama separado no mesmo arquivo FigJam se possivel.
Nao pule paginas subsequentes: ficha com abas, modais, lote, contabilidade,
cadastros por dominio, QR e wizard de novo bem devem aparecer.
```

---

## Referencia rapida de edges (para nao perder subsequentes)

| De | Para | Trigger |
|----|------|---------|
| Login | Home | submit valido |
| Home | 5 modulos | Abrir card |
| Lista | Ficha | clique na linha |
| Lista | Novo | botao Novo patrimonio |
| Lista | Dialog QR / Plaqueta | menu Plaqueta |
| Novo | Ficha | cadastro OK |
| Novo | Plaqueta | acao do toast |
| Ficha | Transferir um | botao Transferir |
| Ficha | Plaqueta | botao Gerar plaqueta |
| Ficha | Modais | acoes das abas |
| Ficha Baixado | bloqueio | sem transferencia/adicao |
| Lote | Transferir um | link na nav |
| Lote | Dialog review | Revisar transferencia |
| Lote | Resultado | confirmar lote |
| Transferir um | Ficha?aba=Transferencias | sucesso |
| Contabilizacao | Calcular | Etapa 1 |
| Contabilizacao | Contabilizar | Etapa 2 apos calculo |
| Cadastros | 9 listas | `?lista=` |
| Ler QR | Ficha | tag reconhecida |
| Qualquer shell | Home | Voltar ou Logo |
| Menu usuario | Login | Sair |
