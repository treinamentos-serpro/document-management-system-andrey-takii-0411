const { test } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');
const documentPresenter = require('../src/controllers/documentPresenter');
const documentService = require('../src/services/documentService');

// Teste de fumaça do seed: garante que o app Express foi exportado.
// Novos testes serão adicionados durante os Steps 2, 6 e 7 com auxílio do Copilot.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('a resposta pública omite o nome interno de armazenamento', () => {
  const document = {
    id: 'document-1',
    originalName: 'relatorio.pdf',
    size: 12,
    uploadedAt: '2026-11-04T12:00:00.000Z',
    owner: 'usuario-1',
    storageName: 'arquivo-interno',
  };

  assert.deepStrictEqual(documentPresenter.toPublicDocument(document), {
    id: 'document-1',
    originalName: 'relatorio.pdf',
    size: 12,
    uploadedAt: '2026-11-04T12:00:00.000Z',
    owner: 'usuario-1',
  });
});

test('o service representa entrada inválida com erro de aplicação', async () => {
  await assert.rejects(
    documentService.createDocument(null, 'usuario-1'),
    (error) => {
      assert.strictEqual(error.name, 'DocumentError');
      assert.strictEqual(error.code, 'FILE_REQUIRED');
      assert.strictEqual(error.status, undefined);
      return true;
    },
  );
});

test('o service não encontra documentos inexistentes', () => {
  assert.throws(
    () => documentService.getDocumentForDownload('inexistente', 'usuario-1'),
    (error) => error.code === 'DOCUMENT_NOT_FOUND' && error.status === undefined,
  );
});
