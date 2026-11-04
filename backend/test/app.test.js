const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');

const storageDir = fsSync.mkdtempSync(path.join(os.tmpdir(), 'dms-api-test-'));
process.env.STORAGE_DIR = storageDir;

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

test('upload, listagem e download funcionam pela API HTTP', async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const fileContent = 'conteudo de teste do DMS';
    const formData = new FormData();
    formData.append('file', new Blob([fileContent], { type: 'text/plain' }), 'relatorio.txt');

    const uploadResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      headers: { 'X-User-Id': 'usuario-teste' },
      body: formData,
    });
    assert.strictEqual(uploadResponse.status, 201);

    const uploadedDocument = await uploadResponse.json();
    assert.strictEqual(uploadedDocument.originalName, 'relatorio.txt');
    assert.strictEqual(uploadedDocument.size, Buffer.byteLength(fileContent));
    assert.strictEqual(uploadedDocument.owner, 'usuario-teste');
    assert.strictEqual(Object.hasOwn(uploadedDocument, 'storageName'), false);

    const storedFiles = await fs.readdir(storageDir);
    assert.strictEqual(storedFiles.length, 1);
    assert.strictEqual(await fs.readFile(path.join(storageDir, storedFiles[0]), 'utf8'), fileContent);

    const listResponse = await fetch(`${baseUrl}/documents`, {
      headers: { 'X-User-Id': 'usuario-teste' },
    });
    assert.strictEqual(listResponse.status, 200);
    assert.deepStrictEqual(await listResponse.json(), [uploadedDocument]);

    const otherUserListResponse = await fetch(`${baseUrl}/documents`, {
      headers: { 'X-User-Id': 'outro-usuario' },
    });
    assert.strictEqual(otherUserListResponse.status, 200);
    assert.deepStrictEqual(await otherUserListResponse.json(), []);

    const downloadResponse = await fetch(
      `${baseUrl}/documents/${uploadedDocument.id}/download`,
      { headers: { 'X-User-Id': 'usuario-teste' } },
    );
    assert.strictEqual(downloadResponse.status, 200);
    assert.strictEqual(await downloadResponse.text(), fileContent);

    const forbiddenDownloadResponse = await fetch(
      `${baseUrl}/documents/${uploadedDocument.id}/download`,
      { headers: { 'X-User-Id': 'outro-usuario' } },
    );
    assert.strictEqual(forbiddenDownloadResponse.status, 404);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await fs.rm(storageDir, { recursive: true, force: true });
  }
});
