import express, { Express } from 'express';
import cors from 'cors';
import compression from 'compression';
import { Database } from './database';
import { createRouter, RouterOptions } from './router';
import { createStaticMiddleware, createHomepageMiddleware, StaticOptions } from './static';
import { loadMiddlewares } from './loader';
import { loadRewriteRules, createRewriterMiddleware } from './rewriter';
import { logger } from './logger';

/**
 * Server configuration options
 */
export interface ServerOptions extends RouterOptions, StaticOptions {
  port?: number;
  host?: string;
  noCors?: boolean;
  noGzip?: boolean;
  delay?: number;
  quiet?: boolean;
  routes?: string;
  middlewares?: string;
}

/**
 * Create Express server with API Faker
 *
 * @param db - Database instance
 * @param options - Server configuration options
 * @returns Express application
 *
 * @example
 * ```typescript
 * const db = new Database('db.json');
 * await db.init();
 * const app = await createServer(db, { port: 3000 });
 * ```
 */
export async function createServer(
  db: Database,
  options: Partial<ServerOptions> = {}
): Promise<Express> {
  const app = express();

  // CORS
  if (!options.noCors) {
    app.use(cors());
  }

  // GZIP compression
  if (!options.noGzip) {
    app.use(compression());
  }

  // JSON body parser
  app.use(express.json());

  // Delay middleware (for testing/simulation)
  if (options.delay && options.delay > 0) {
    const delay = options.delay;
    app.use((_req, _res, next) => {
      setTimeout(() => {
        next();
      }, delay);
    });
  }

  // Request logger (unless quiet)
  if (!options.quiet) {
    app.use((req, _res, next) => {
      logger.request(req.method, req.url);
      next();
    });
  }

  // Custom middlewares (load before routes)
  if (options.middlewares) {
    try {
      const middlewares = await loadMiddlewares(options.middlewares);
      for (const middleware of middlewares) {
        app.use(middleware);
      }
      if (!options.quiet) {
        logger.success(`Loaded custom middlewares from ${options.middlewares}`);
      }
    } catch (error) {
      logger.error(
        `Failed to load middlewares: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  // Homepage middleware (must be before static to allow custom index.html)
  app.use(createHomepageMiddleware(options));

  // Static file server
  app.use(createStaticMiddleware(options));

  // Custom route rewriting (load before all routes)
  if (options.routes) {
    try {
      const rules = await loadRewriteRules(options.routes);
      const rewriter = createRewriterMiddleware(rules);
      app.use(rewriter);
      if (!options.quiet) {
        logger.success(`Loaded route rewrite rules from ${options.routes}`);
      }
    } catch (error) {
      logger.error(
        `Failed to load routes: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  // Special endpoint: /db (full database dump)
  app.get('/db', (_req, res) => {
    res.json(db.getData());
  });

  // API routes
  const router = createRouter(db, options);
  app.use(router);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  return app;
}

/**
 * Start the server
 *
 * @param app - Express application
 * @param options - Server options (port, host)
 * @returns Server instance
 */
export function startServer(
  app: Express,
  options: Pick<ServerOptions, 'port' | 'host' | 'quiet'> = {}
): ReturnType<Express['listen']> {
  const port = options.port || 3000;
  const host = options.host || 'localhost';

  return app.listen(port, host, () => {
    if (!options.quiet) {
      logger.banner([
        '🚀 API Faker is running!',
        '',
        '  Resources:',
        `  http://${host}:${String(port)}/`,
        '',
        '  Home:',
        `  http://${host}:${String(port)}`,
      ]);
    }
  });
}
