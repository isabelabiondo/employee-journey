# Employee Journey — CI&T

Portal interno do projeto **Radar Chatbot · Employee Journey**, desenvolvido como Google Apps Script Web App. Reúne discovery, roadmap e fases num único lugar, com navegação por abas e toggle PT/EN.

---

## Estrutura do projeto

```
Code.gs          → Roteamento entre páginas + leitura da planilha
Discovery.html   → Página de discovery com acordeões (notas + insights + tabela comparativa)
Roadmap.html     → Gantt interativo conectado ao Google Sheets
```

> **Fases** (`Fases.html`) será adicionada em breve.

---

## Setup — do zero ao deploy

### 1. Criar o projeto no Apps Script

Acesse [script.google.com](https://script.google.com) → Novo projeto → renomeie para `Employee Journey`.

### 2. Adicionar os arquivos

No editor, substitua o conteúdo do `Code.gs` padrão pelo arquivo deste repositório.

Crie dois arquivos HTML (**Arquivo → Novo → HTML**), nomeando cada um exatamente como `Discovery` e `Roadmap` (sem extensão). Cole o conteúdo de cada arquivo do repositório.

### 3. Criar a planilha do Roadmap

No editor do Apps Script, selecione a função `createRoadmapSheet` no menu de funções e clique em **▶ Executar**. Na primeira execução, o Apps Script pedirá autorização — aceite.

Após a execução, clique em **Registros de execução** e copie o ID da planilha que aparece no log.

### 4. Conectar a planilha

Em `Code.gs`, na linha:

```javascript
const ROADMAP_SHEET_ID = '';
```

Cole o ID entre as aspas.

### 5. Deploy

**Implanta → Nova implantação → Aplicativo da Web**

| Configuração | Valor |
|---|---|
| Executar como | Eu |
| Quem tem acesso | Qualquer pessoa da CI&T |

Clique em **Implantar** e copie a URL gerada.

---

## Navegação

| URL | Página |
|---|---|
| `[url]/exec?page=discovery&lang=pt` | Discovery (PT) |
| `[url]/exec?page=discovery&lang=en` | Discovery (EN) |
| `[url]/exec?page=roadmap&lang=pt` | Roadmap (PT) |
| `[url]/exec?page=roadmap&lang=en` | Roadmap (EN) |

O toggle PT/EN no canto superior direito muda o idioma sem recarregar.

---

## Como atualizar o conteúdo

### Discovery
O conteúdo das seções (notas e insights) está hardcoded no `Discovery.html`, no objeto `sections` dentro do `<script>`. Edite diretamente e faça um novo deploy.

### Roadmap
Abra a planilha **Employee Journey — Roadmap Data** no Google Drive e edite as linhas na aba `Roadmap`. Depois clique em **Atualizar** na página — os dados são carregados em tempo real, sem precisar de novo deploy.

**Estrutura da planilha:**

| Coluna | Valores possíveis |
|---|---|
| `type` | `PHASE`, `TASK`, `MILESTONE` |
| `phase_id` | 1, 2, 3, 4... |
| `phase_name` | Nome da fase (só em linhas PHASE) |
| `phase_status` | `IN PROGRESS`, `PLANNED`, `TO BE DEFINED` |
| `task_name` | Nome da tarefa ou marco |
| `start_date` | `dd/mm/aaaa` |
| `end_date` | `dd/mm/aaaa` (vazio para milestones) |
| `is_milestone` | `TRUE` ou `FALSE` |

A **data de lançamento** fica na aba `Config`, célula `B2` (formato `dd/mm/aaaa`).

---

## Quando fazer novo deploy

Novo deploy é necessário **apenas quando o código mudar** (arquivos `.gs` ou `.html`). Mudanças na planilha aparecem automaticamente ao clicar em Atualizar.

Para atualizar um deploy existente: **Implanta → Gerenciar implantações → ✏️ Editar → Nova versão → Implantar**.

---

## Paleta de cores (CI&T)

| Token | Hex | Uso |
|---|---|---|
| `--ciandt-coral` | `#FA5A50` | Destaque, fase 1, hoje |
| `--ciandt-navy` | `#000050` | Base, fase 2, headers |
| `--ciandt-light-blue` | `#B4DCFA` | Fase 3 |
| `--ciandt-grey-mid` | `#D2D4DC` | Fase 4+ |
| `--ciandt-deep-red` | `#690037` | Linha de data de lançamento |

Tipografia: **DM Sans** via Google Fonts (substitui PP Fragment Glare em produção).
