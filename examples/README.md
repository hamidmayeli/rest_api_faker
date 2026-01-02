# API Faker Examples

This directory contains example files demonstrating how to extend API Faker with custom routes and middlewares.

## Custom Routes

### File: `custom-routes.cjs`

Example of creating custom routes that will be added to your API Faker server.

**Usage:**
```bash
api-faker db.json --routes examples/custom-routes.cjs
```

**Routes provided:**
- `GET /custom` - Returns a custom message
- `POST /custom` - Creates a custom resource

**Code pattern:**
```javascript
module.exports = function(router) {
  router.get('/custom', (req, res) => {
    res.json({ message: 'This is a custom route!' });
  });

  router.post('/custom', (req, res) => {
    res.status(201).json({ 
      message: 'Created custom resource', 
      data: req.body 
    });
  });
};
```

## Custom Middleware

### File: `custom-middleware.cjs`

Example of creating custom middleware that will be applied to all requests.

**Usage:**
```bash
api-faker db.json --middlewares examples/custom-middleware.cjs
```

**What it does:**
- Adds a custom header `X-Custom-API: API Faker` to all responses
- Logs custom information for each request

**Code pattern:**
```javascript
module.exports = function(req, res, next) {
  // Add a custom header
  res.setHeader('X-Custom-API', 'API Faker');
  
  // Log custom information
  console.log(`[Custom Middleware] ${req.method} ${req.url}`);
  
  next();
};
```

## Combined Usage

You can use both custom routes and middlewares together:

```bash
api-faker db.json --routes examples/custom-routes.cjs --middlewares examples/custom-middleware.cjs
```

## ES Module Support

API Faker also supports ES modules (`.mjs`) and TypeScript (`.ts`) files:

```javascript
// custom-routes.mjs
import { Router } from 'express';

export default function() {
  const router = Router();
  router.get('/custom', (req, res) => {
    res.json({ message: 'ES Module route!' });
  });
  return router;
}
```

```javascript
// custom-middleware.mjs
export default function(req, res, next) {
  console.log('ES Module middleware');
  next();
}
```

## Array of Middlewares

You can export an array of middlewares to apply multiple middlewares from one file:

```javascript
module.exports = [
  function firstMiddleware(req, res, next) {
    console.log('First middleware');
    next();
  },
  function secondMiddleware(req, res, next) {
    console.log('Second middleware');
    next();
  }
];
```

## Notes

- Routes are added before the default API Faker routes
- Middlewares are applied after built-in middlewares (CORS, compression) but before routes
- Custom routes can override default behavior if they match the same paths
- All Express.js middleware and routing features are supported
