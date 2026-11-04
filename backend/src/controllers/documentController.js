const documentService = require('../services/documentService');

async function upload(req, res) {
  const document = await documentService.createDocument(req.file, req.owner);
  res.status(201).json(documentService.toPublicDocument(document));
}

function list(req, res) {
  const documents = documentService.listDocuments(req.owner);
  res.json(documents.map(documentService.toPublicDocument));
}

function download(req, res, next) {
  try {
    const { document, filePath } = documentService.getDocumentForDownload(
      req.params.id,
      req.owner,
    );

    res.download(filePath, document.originalName, (error) => {
      if (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { upload, list, download };