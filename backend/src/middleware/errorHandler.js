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

  if (error.name === 'DocumentError') {
    const statusByCode = {
      FILE_REQUIRED: 400,
      DOCUMENT_NOT_FOUND: 404,
    };
    const status = statusByCode[error.code] || 500;
    const isKnownError = status !== 500;

    return res.status(status).json({
      error: {
        code: isKnownError ? error.code : 'INTERNAL_ERROR',
        message: isKnownError ? error.message : 'Erro interno do servidor.',
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