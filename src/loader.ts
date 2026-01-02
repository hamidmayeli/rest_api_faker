import { pathToFileURL } from 'node:url';
import { RequestHandler } from 'express';

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
    const module = (await import(fileUrl)) as { default?: unknown } & Record<string, unknown>;
    return module;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to load module '${filePath}': ${message}\n` +
        `\nMake sure:\n` +
        `  - The file exists and is a valid JavaScript file\n` +
        `  - The file doesn't have syntax errors\n` +
        `  - All dependencies are installed`
    );
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
      throw new Error(
        `Middleware file '${filePath}' at index ${indexStr} is not a function, got ${typeof mw}`
      );
    }
  }

  return middlewares as RequestHandler[];
}
