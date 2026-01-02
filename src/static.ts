/**
 * Static file server module
 */

import express, { RequestHandler } from 'express';
import { existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Static server options
 */
export interface StaticOptions {
  directory?: string;
  enabled?: boolean;
}

/**
 * Create static file server middleware
 *
 * @param options - Static server configuration
 * @returns Express middleware for serving static files
 *
 * @example
 * ```typescript
 * const staticMiddleware = createStaticMiddleware({ directory: './public' });
 * app.use(staticMiddleware);
 * ```
 */
export function createStaticMiddleware(options: StaticOptions = {}): RequestHandler {
  const directory = options.directory || './public';
  const enabled = options.enabled !== false;
  const staticPath = resolve(process.cwd(), directory);

  // If disabled or directory doesn't exist, return pass-through middleware
  if (!enabled || !existsSync(staticPath)) {
    return (_req, _res, next) => {
      next();
    };
  }

  // Serve static files from the directory
  return express.static(staticPath, {
    index: 'index.html',
    dotfiles: 'ignore',
    redirect: true,
  });
}

/**
 * Create homepage middleware that serves index.html or shows default page
 *
 * @param options - Static server configuration
 * @returns Express request handler
 */
export function createHomepageMiddleware(options: StaticOptions = {}): RequestHandler {
  const directory = options.directory || './public';
  const enabled = options.enabled !== false;
  const staticPath = resolve(process.cwd(), directory);
  const indexPath = resolve(staticPath, 'index.html');

  return (req, res, next) => {
    // Only handle root path
    if (req.path !== '/') {
      next();
      return;
    }

    // If static serving is enabled and index.html exists, let static middleware handle it
    if (enabled && existsSync(indexPath)) {
      next();
      return;
    }

    // Otherwise, show default homepage with available routes
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Faker</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      padding: 3rem;
    }
    h1 {
      color: #667eea;
      font-size: 2.5rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    h2 {
      color: #555;
      font-size: 1.5rem;
      margin-top: 2rem;
      margin-bottom: 1rem;
      border-bottom: 2px solid #667eea;
      padding-bottom: 0.5rem;
    }
    .intro {
      color: #666;
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }
    .endpoint {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 4px;
    }
    .endpoint a {
      color: #667eea;
      text-decoration: none;
      font-family: 'Monaco', 'Courier New', monospace;
      font-weight: bold;
    }
    .endpoint a:hover {
      text-decoration: underline;
    }
    .endpoint p {
      color: #666;
      margin-top: 0.5rem;
      font-size: 0.95rem;
    }
    .info-box {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 1rem;
      margin-top: 2rem;
      border-radius: 4px;
    }
    .info-box p {
      color: #1565c0;
      margin: 0;
    }
    code {
      background: #f5f5f5;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 API Faker</h1>
    <p class="intro">
      Your JSON REST API is up and running! Use the endpoints below to interact with your data.
    </p>

    <h2>📡 Endpoints</h2>
    <div class="endpoint">
      <a href="${baseUrl}/db" target="_blank">${baseUrl}/db</a>
      <p>View the full database</p>
    </div>

    <h2>💡 Tips</h2>
    <div class="info-box">
      <p>
        Use query parameters to filter, sort, and paginate your data. 
        Examples: <code>?_sort=name&_order=asc</code>, <code>?_page=1&_limit=10</code>
      </p>
    </div>
  </div>
</body>
</html>`);
  };
}
