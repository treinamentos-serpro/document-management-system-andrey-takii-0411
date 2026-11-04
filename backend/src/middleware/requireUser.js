function requireUser(req, res, next) {
  const owner = req.get('x-user-id')?.trim();
  if (!owner) {
    return res.status(401).json({
      error: {
        code: 'USER_REQUIRED',
        message: 'Identifique o usuário da requisição.',
      },
    });
  }

  req.owner = owner;
  return next();
}

module.exports = requireUser;