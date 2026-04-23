function loginMiddleware(req, res, next) {
  if (req.path === '/api/v1/login' && req.method === 'POST') {
    return res.json({
      token: 'secret-token',
    });
  }

  authMiddleware (req, res, next);
};

function authMiddleware(req, res, next) {
  // Allow all GET requests
  if (req.method === 'GET') {
    return next();
  }

  // Check for authorization token
  const token = req.headers.authorization;

  if (!token || token !== 'Bearer secret-token') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Please provide a valid authorization token',
    });
  }

  next();
};


module.exports = loginMiddleware;
