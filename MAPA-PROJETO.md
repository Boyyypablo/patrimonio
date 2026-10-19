# Fluxos de Paginas — Gestao de Patrimonio Mutua

> **Prototipo front-end.** Os fluxos abaixo refletem o comportamento atual, com dados na sessao do navegador, login simulado e jobs de contabilizacao simulados. Regras, persistencia e autenticacao serao fechadas na integracao com o backend.

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
| movEntrada | `/movimentacao` | Redireciona para Transferir um bem | redirect |
| movUm | `/movimentacao/transferir` | Movimentacao - Transferir um bem | pagina |
| movLote | `/movimentacao/lote` | Movimentacao - Transferencia em lote | pagina |
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
| umStep1 | Transferir um bem | Etapa 1 - Escolher o bem |
| umStep2 | Transferir um bem | Etapa 2 - Destino |
| umReview | Transferir um bem | Dialog - Revisar transferencia |
| loteStep1 | Movimentacao lote | Etapa 1 - Escolher bens (Marcar / Colar / Faixa) |
| loteStep2 | Movimentacao lote | Etapa 2 - Destino comum |
| loteReview | Movimentacao lote | Dialog - Confirmar lote |
| loteResultado | Movimentacao lote | Secao - Resultado do lote (somente nesta visita) |
| novoStep1 | Novo bem | Wizard - Etapa Geral |
| novoStep2 | Novo bem | Wizard - Etapa Aquisicao |
| novoStep3 | Novo bem | Wizard - Etapa Localizacao |
| contabPeriodo | Contabilizacao | Card - Competencia do periodo |
| contabCalc | Contabilizacao | Etapa 1 - Calcular periodo |
| contabPost | Contabilizacao | Etapa 2 - Contabilizar |
| contabResumo | Contabilizacao | Resumo do periodo (abre sob demanda) |
| contabLista | Contabilizacao | Card - Lista de competencias |
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
  movEntrada{{"/movimentacao redirect"}}
  movUm["Transferir um bem /movimentacao/transferir"]
  movLote["Transferencia em lote /movimentacao/lote"]
  contab["Contabilizacao /contabilizacao"]
  cadastros["Cadastros /cadastros"]
  lerQr["Ler QR /ler-qr"]

  login ==>|"auth OK"| home
  home -->|"Sair"| login

  home ==> patrimList
  home ==> movUm
  movEntrada --> movUm
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

  movUm <-->|"abas"| movLote
  movUm -->|"sucesso"| patrimFicha
  movLote -->|"resultado"| patrimFicha

  lerQr -->|"tag valida"| patrimFicha
  patrimPlaqueta -.->|"anexa QR"| patrimFicha

  home -->|"Voltar / Logo"| home
```

---

## DIAGRAMA 02 — Autenticacao e shell

Login simulado: qualquer e-mail valido e senha preenchida entram. No prototipo, as rotas internas ainda nao exigem login; a protecao vem com a autenticacao do backend.

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

## DIAGRAMA 05 — Movimentacao (um bem + lote)

A entrada padrao e Transferir um bem; as abas alternam entre os dois fluxos.

```mermaid
flowchart TD
  home(["Home"]) --> movUm["Transferir um bem"]
  entrada{{"/movimentacao"}} --> movUm
  fichaEntry(["Ficha do bem"]) -->|"Transferir ?tag="| movUm
  movUm <-->|"abas"| movLote["Transferencia em lote"]

  movUm --> umStep1["Etapa 1 Escolher o bem"]
  umStep1 -->|"plaqueta ou lista"| umStep2["Etapa 2 Destino"]
  umStep2 --> umReview["Dialog Revisar"]
  umReview -->|"confirmar"| ficha["Ficha ?aba=Transferencias"]

  movLote --> loteStep1["Etapa 1 Escolher bens"]
  loteStep1 --> pickMode{"Modo"}
  pickMode -->|"Marcar na lista"| selTable["Tabela com checkboxes"]
  pickMode -->|"Colar plaquetas"| selList["Textarea de plaquetas"]
  pickMode -->|"Faixa de numeros"| selRange["Plaqueta inicial e final"]
  selTable --> loteStep2["Etapa 2 Destino comum"]
  selList --> loteStep2
  selRange --> loteStep2
  loteStep2 --> loteReview["Dialog Revisar lote"]
  loteReview -->|"confirmar"| results["Resultado por plaqueta"]
  results -->|"abrir ficha"| ficha
```

---

## DIAGRAMA 06 — Contabilizacao (etapas subsequentes)

Pagina em coluna unica (cards empilhados). O resumo fica oculto ate o usuario clicar em "Ver resumo do periodo".

```mermaid
flowchart TD
  home(["Home"]) --> contab["Contabilizacao"]
  contab --> inputPeriod["Card Competencia MM/AAAA"]
  inputPeriod -->|"Consultar"| etapas["Card Etapas da competencia"]

  etapas --> step1["Etapa 1 Calcular"]
  step1 -->|"job simulado ~1.2s"| calcDone{"Calculo concluido?"}
  calcDone -->|"sim"| step2["Etapa 2 Contabilizar"]
  calcDone -->|"erro"| step1
  step2 -->|"job simulado ~1.2s"| postDone{"Contabilizado?"}
  postDone -->|"sim"| locked["Competencia fechada"]
  postDone -->|"erro"| step2

  etapas -->|"Ver resumo"| resumo["Resumo do periodo"]
  resumo --> composicao["Composicao: contabil - residual = base / 60"]
  resumo --> itens["Bens no calculo + soma"]
  resumo --> excluidos["Bens excluidos"]
  resumo -->|"Ocultar"| etapas

  contab --> lista["Card Lista de competencias"]
  lista -->|"selecionar outra"| inputPeriod
```

Regra da projecao (prototipo): `residual = min(contabil, aquisicao x residual%)`, `base = contabil - residual`, `mensal = base / 60`. A contabilizacao nao altera o valor contabil dos bens nesta versao.

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
  home ==> movUm2["Transferir um bem"]
  movUm2 ==> lote["Transferencia em lote"]
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
| Home / `/movimentacao` | Transferir um | card Movimentacao / redirect |
| Transferir um | Lote | aba Transferencia em lote |
| Lote | Transferir um | aba Transferir um bem |
| Lote | Etapa 2 Destino | Continuar para o destino |
| Lote | Dialog review | Revisar lote |
| Lote | Resultado | confirmar lote |
| Transferir um | Ficha?aba=Transferencias | sucesso |
| Contabilizacao | Calcular | Etapa 1 |
| Contabilizacao | Contabilizar | Etapa 2 apos calculo |
| Contabilizacao | Resumo do periodo | Ver resumo do periodo |
| Cadastros | 9 listas | `?lista=` |
| Ler QR | Ficha | tag reconhecida |
| Qualquer shell | Home | Voltar ao inicio, trilha Inicio ou Logo |
| Menu usuario | Login | Sair |
