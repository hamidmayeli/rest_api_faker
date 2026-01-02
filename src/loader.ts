import { pathToFileURL } from 'node:url';
import { Router, RequestHandler } from 'express';

/**
 * Load a JavaScript or TypeScript module dynamically
 * 
 * @param filePath - Path to the module file
 * @returns Module exports
 * @throws Error if module cannot be loaded
 * 
 * @example
 * ```typescript
 * const module = await loadModule('./routes.js');
 * ```
 */
export async function loadModule(filePath: string): Promise<unknown> {
  try {
    const fileUrl = pathToFileURL(filePath).href;
    const module = await import(fileUrl) as { default?: unknown } & Record<string, unknown>;
    return module;
  } catch (error) {
    throw new Error(`Failed to load module '${filePath}': ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Load custom routes from a file
 * 
 * @param filePath - Path to the routes file
 * @returns Express router with custom routes
 * @throws Error if routes file is invalid
 * 
 * @example
 * ```typescript
 * // routes.js
 * module.exports = (router) => {
 *   router.get('/custom', (req, res) => {
 *     res.json({ message: 'Custom route' });
 *   });
 * };
 * 
 * // Usage
 * const router = await loadRoutes('./routes.js');
 * app.use(router);
 * ```
 */
export async function loadRoutes(filePath: string): Promise<Router> {
  const module = await loadModule(filePath);
  
  // Check for default export first (ES modules or wrapped CommonJS)
  let routeFunction: unknown;
  if (typeof module === 'object' && module !== null && 'default' in module) {
    const defaultExport = (module as { default: unknown }).default;
    // If default is also an object with a default property, unwrap it
    if (typeof defaultExport === 'object' && defaultExport !== null && 'default' in defaultExport) {
      routeFunction = (defaultExport as { default: unknown }).default;
    } else {
      routeFunction = defaultExport;
    }
  } else {
    routeFunction = module;
  }

  // Validate function
  if (typeof routeFunction !== 'function') {
    throw new Error(`Routes file '${filePath}' must export a function, got ${typeof routeFunction}`);
  }

  // Create router and apply custom routes
  const router = Router();
  
  try {
    const result = (routeFunction as (router: Router) => Router | undefined)(router);
    
    // Support both patterns:
    // 1. Function that modifies the passed router
    // 2. Function that returns a router
    return result instanceof Router ? result : router;
  } catch (error) {
    throw new Error(`Failed to initialize routes from '${filePath}': ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Load custom middleware from a file
 * 
 * @param filePath - Path to the middleware file
 * @returns Array of Express middleware functions
 * @throws Error if middleware file is invalid
 * 
 * @example
 * ```typescript
 * // middleware.js
 * module.exports = (req, res, next) => {
 *   console.log('Custom middleware');
 *   next();
 * };
 * 
 * // Or export array
 * module.exports = [
 *   (req, res, next) => { console.log('First'); next(); },
 *   (req, res, next) => { console.log('Second'); next(); }
 * ];
 * 
 * // Usage
 * const middlewares = await loadMiddlewares('./middleware.js');
 * middlewares.forEach(mw => app.use(mw));
 * ```
 */
export async function loadMiddlewares(filePath: string): Promise<RequestHandler[]> {
  const module = await loadModule(filePath);
  
  // Check for default export first (ES modules or wrapped CommonJS)
  let middlewareExport: unknown;
  if (typeof module === 'object' && module !== null && 'default' in module) {
    const defaultExport = (module as { default: unknown }).default;
    // If default is also an object with a default property, unwrap it
    if (typeof defaultExport === 'object' && defaultExport !== null && 'default' in defaultExport) {
      middlewareExport = (defaultExport as { default: unknown }).default;
    } else {
      middlewareExport = defaultExport;
    }
  } else {
    middlewareExport = module;
  }

  // Normalize to array
  const middlewares = Array.isArray(middlewareExport) ? middlewareExport : [middlewareExport];

  // Validate all are functions
  for (let i = 0; i < middlewares.length; i++) {
    const mw: unknown = middlewares[i];
    if (typeof mw !== 'function') {
      const indexStr = String(i);
      throw new Error(`Middleware file '${filePath}' at index ${indexStr} is not a function, got ${typeof mw}`);
    }
  }

  return middlewares as RequestHandler[];
}
