---
description: "Implemente um caso de uso do DMS integrando backend, frontend e testes conforme necessário."
name: implementar-fluxo-dms
argument-hint: descreva o caso de uso a implementar
agent: agent
---

# Implementar caso de uso do DMS

Implemente o seguinte caso de uso no Document Management System:

`${input:casoDeUso:descreva o caso de uso}`

Antes de editar:

- Leia as instruções aplicáveis do projeto e consulte `docs/specs/dms-spec.md`, se existir.
- Inspecione as rotas, componentes, serviços e testes próximos ao comportamento solicitado. Siga os padrões encontrados em vez de criar estruturas duplicadas.
- Defina o menor conjunto de arquivos necessário para concluir o caso de uso.

Requisitos de implementação:

- No backend, preserve o fluxo `routes -> controllers -> services -> repositories` e a separação de responsabilidades.
- No frontend, use componentes funcionais com hooks e mantenha chamadas HTTP centralizadas em `frontend/src/services`, usando `fetch` com o prefixo `/api`.
- Mantenha nomes de símbolos em inglês e mensagens apresentadas ao usuário em português.
- Se o caso de uso envolver upload, grave arquivos somente no filesystem local em `backend/storage`, usando Multer com `diskStorage`; mantenha metadados em memória conforme a fase atual do projeto. Não use armazenamento externo.
- Preserve os contratos e as funcionalidades existentes. Não adicione dependências, autenticação, persistência ou abstrações fora do escopo solicitado.
- Trate erros nos limites do sistema e não exponha caminhos locais ou detalhes internos.
- Inclua ou ajuste testes focados para os comportamentos e erros relevantes, seguindo os testes existentes.
- Edite apenas os arquivos necessários para este caso de uso; não faça refatorações ou alterações de UI sem relação com ele.

Validação:

- Se alterar o backend, execute `npm test` em `backend/`.
- Se alterar o frontend, execute `npm run build` em `frontend/`.
- Corrija regressões causadas pela implementação dentro deste escopo e repita a validação correspondente.

Ao concluir, resuma o comportamento implementado, liste os principais arquivos alterados e informe os comandos de validação executados e seus resultados. Destaque qualquer requisito que permaneça bloqueado ou dependa de uma decisão externa.
