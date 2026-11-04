const { randomUUID } = require('node:crypto');
const documentRepository = require('../repositories/documentRepository');
const fileStorageRepository = require('../repositories/fileStorageRepository');

class DocumentError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function createDocument(file, owner) {
  if (!file) {
    throw new DocumentError(400, 'FILE_REQUIRED', 'Envie um arquivo no campo "file".');
  }

  const document = {
    id: randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    storageName: file.filename,
  };

  try {
    return documentRepository.save(document);
  } catch (error) {
    await fileStorageRepository.remove(file.filename);
    throw error;
  }
}

function listDocuments(owner) {
  return documentRepository.findByOwner(owner);
}

function getDocumentForDownload(id, owner) {
  const document = documentRepository.findById(id);
  if (!document || document.owner !== owner) {
    throw new DocumentError(404, 'DOCUMENT_NOT_FOUND', 'Documento não encontrado.');
  }

  return {
    document,
    filePath: fileStorageRepository.getFilePath(document.storageName),
  };
}

function toPublicDocument({ storageName: _storageName, ...document }) {
  return document;
}

module.exports = {
  DocumentError,
  createDocument,
  listDocuments,
  getDocumentForDownload,
  toPublicDocument,
};