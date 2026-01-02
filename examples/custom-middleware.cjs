// Example custom middleware file (CommonJS)
module.exports = function(req, res, next) {
  // Add a custom header
  res.setHeader('X-Custom-API', 'API Faker');
  
  // Log custom information
  console.log(`[Custom Middleware] ${req.method} ${req.url}`);
  
  next();
};
