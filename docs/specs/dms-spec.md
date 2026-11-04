# Especificação - Document Management System

## 1. Objetivo

Permitir que usuários enviem, listem e baixem seus documentos, armazenados no filesystem local da aplicação.

## 2. Escopo

### Dentro do escopo

- Upload de um documento por requisição.
- Listagem dos documentos do usuário identificado na requisição.
- Download de um documento pertencente ao usuário identificado.
- Metadados mantidos em memória nesta fase.
- Armazenamento de arquivos em `backend/storage`, usando Multer com `diskStorage`.

### Fora do escopo

- Armazenamento externo ou em nuvem.
- Versionamento, busca avançada ou compartilhamento de documentos.
- Cadastro, login e gestão completa de usuários.
- Persistência durável de metadados após reinício do processo.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve aceitar um arquivo enviado como `multipart/form-data`, no campo `file`. |
| RF-02 | O sistema deve gerar um identificador único para cada documento. |
| RF-03 | O sistema deve gravar o arquivo em `backend/storage` via Multer `diskStorage`, com nome interno gerado pelo sistema. |
| RF-04 | O sistema deve registrar `id`, `originalName`, `size`, `uploadedAt` e `owner` para cada documento. |
| RF-05 | O sistema deve listar somente documentos do usuário identificado na requisição. |
| RF-06 | O sistema deve permitir baixar um documento pelo identificador, somente se pertencer ao usuário identificado. |
| RF-07 | O sistema deve retornar erro JSON consistente para entrada inválida, documento inexistente, acesso não autorizado e falhas de armazenamento. |
| RF-08 | Se o registro de metadados falhar após a gravação, o sistema deve tentar remover o arquivo gravado para evitar órfãos. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Arquivos devem permanecer no filesystem local; não utilizar provedores externos. |
| RNF-02 | Upload deve usar Multer com `diskStorage`, sem manter o conteúdo do arquivo em memória. |
| RNF-03 | Metadados ficam em memória e podem ser perdidos ao reiniciar o backend. |
| RNF-04 | Porta, diretório de armazenamento e limite de upload devem ser configuráveis por variáveis de ambiente. |
| RNF-05 | O limite padrão de upload deve ser 10 MiB, configurável por `MAX_FILE_SIZE_BYTES`. |
| RNF-06 | O nome original não deve ser usado como caminho ou nome físico do arquivo. |
| RNF-07 | Erros da API devem ter formato estável e não expor caminhos internos do servidor. |
| RNF-08 | A API deve permitir apenas um arquivo por requisição de upload. |

## 5. Identidade e autorização

O modelo prevê documentos associados a um `owner`, mas o projeto ainda não implementa autenticação. A identidade deve ser obtida por uma camada confiável de autenticação/autorização, fora das regras de negócio.

Até essa camada ser definida, o uso de um cabeçalho como `X-User-Id` deve ser considerado somente para desenvolvimento e testes locais. Ele não autentica o usuário e não é seguro para produção. A implementação não deve permitir que um cliente escolha livremente o proprietário de um documento em um ambiente exposto.

## 6. Modelo de dados

### Documento

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | string | Sim | UUID gerado pelo backend. |
| `originalName` | string | Sim | Nome original informado pelo cliente, apenas metadado. |
| `size` | number | Sim | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Sim | Data/hora do upload em ISO 8601 UTC. |
| `owner` | string | Sim | Identificador obtido do contexto confiável da requisição. |
| `storageName` | string | Sim | Nome interno gerado para localizar o arquivo no disco; não exposto ao cliente. |

Os metadados devem ser armazenados em memória. O arquivo físico pode permanecer após reinício, mas o sistema não terá metadados suficientes para listá-lo ou baixá-lo; persistência e reconciliação não fazem parte desta versão.

## 7. Contratos de API

Durante desenvolvimento, o frontend chama `/api/...` e o proxy do Vite remove o prefixo. As rotas do backend são `/upload` e `/documents...`.

### `POST /upload`

- Entrada: `multipart/form-data` com exatamente um campo `file`.
- Sucesso: `201 Created`.
- Resposta: metadados públicos do documento; não incluir `storageName` nem caminho local.

```json
{
  "id": "uuid",
  "originalName": "relatorio.pdf",
  "size": 12345,
  "uploadedAt": "2026-11-04T12:00:00.000Z",
  "owner": "usuario-1"
}