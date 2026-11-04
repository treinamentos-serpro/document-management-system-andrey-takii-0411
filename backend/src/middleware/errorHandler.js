function errorHandler(error, _req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.name === 'MulterError') {
    const tooLarge = error.code === 'LIMIT_FILE_SIZE';
    return res.status(tooLarge ? 413 : 400).json({
      error: {
        code: tooLarge ? 'FILE_TOO_LARGE' : 'INVALID_UPLOAD',
        message: tooLarge
          ? 'O arquivo excede o limite permitido.'
          : 'Não foi possível processar o upload.',
      },
    });
  }

  if (error.status && error.code) {
    return res.status(error.status).json({
      error: { code: error.code, message: error.message },
    });
  }

  const fileMissing = error.code === 'ENOENT';
  return res.status(fileMissing ? 404 : 500).json({
    error: {
      code: fileMissing ? 'DOCUMENT_FILE_NOT_FOUND' : 'INTERNAL_ERROR',
      message: fileMissing ? 'Arquivo do documento não encontrado.' : 'Erro interno do servidor.',
    },
  });
}

module.exports = errorHandler;