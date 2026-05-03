## Problema

No mobile, cada tarefa hoje vira um card grande (~200px de altura) com título, descrição, data, botões "Editar" e "Abrir" empilhados. Com 14+ tarefas o usuário rola muito.

## Proposta

Refatorar `src/components/workspace/TasksRow.tsx` para usar **layout em linha compacta no mobile** (≈64px por item) e manter o grid de cards atual no desktop (≥`md`).

### Item compacto no mobile

Cada tarefa vira uma linha única:

```text
[✓]  Confirmar visita técnica Mariana          [⋯]
     Mariana Souza · 03/05 05:00  •  atrasada
```

- Checkbox arredondado à esquerda (toggle status, mesma ação atual).
- Título em uma linha (`truncate`), descrição/contato/horário condensados em uma segunda linha menor com `truncate`.
- Borda esquerda colorida indicando prioridade (mantém o atual).
- Linha clicável: tap no corpo abre o contato (se houver) ou o diálogo de edição.
- Menu `⋯` (popover) com "Editar", "Abrir conversa", "Excluir" — remove os 2 botões grandes que ocupam espaço.
- Indicador "atrasada" como ponto/badge inline pequeno em vez de um chip de 32px.

### Densidade e navegação

- Filtros (Todas/Hoje/Atrasadas/Concluídas) viram chips menores em uma linha rolável horizontal no mobile, com contador embutido (ex.: "Hoje · 3").
- Adiciona seção colapsável: agrupar por **Atrasadas / Hoje / Próximas / Concluídas** quando filtro = "todas". Cada grupo com header sticky pequeno e contador, podendo recolher.
- Botão "Nova" continua no topo, mas vira FAB compacto no mobile (canto, fixo dentro da seção) para não competir com os filtros.

### Desktop

- A partir de `md:`, mantém o grid de cards atual (2/3 colunas) sem alterações visuais relevantes.

## Arquivos

- `src/components/workspace/TasksRow.tsx` — única alteração; usa `Popover`/`DropdownMenu` já existentes em `components/ui` para o menu de ações e `cn` para alternar entre layout `flex-row` (mobile) e `grid` (desktop).

## Resultado esperado

Cada tarefa passa de ~200px para ~60px no mobile (~3× mais densa), com agrupamento por urgência reduzindo ainda mais a rolagem em listas longas. Comportamento desktop preservado.