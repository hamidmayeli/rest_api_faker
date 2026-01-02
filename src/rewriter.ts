import { RequestHandler } from 'express';
import { readFile } from 'node:fs/promises';

/**
 * Route rewrite rules mapping
 * Maps incoming URL patterns to target URL patterns
 *
 * @example
 * ```json
 * {
 *   "/api/*": "/$1",
 *   "/me": "/profile",
 *   "/news/top": "/news?_sort=date&_order=asc&_limit=10"
 * }
 * ```
 */
export type RewriteRules = Record<string, string>;

/**
 * Load rewrite rules from a JSON file
 *
 * @param filePath - Path to the JSON file containing route mappings
 * @returns Rewrite rules object
 * @throws Error if file cannot be loaded or parsed
 *
 * @example
 * ```typescript
 * const rules = await loadRewriteRules('./routes.json');
 * const middleware = createRewriterMiddleware(rules);
 * app.use(middleware);
 * ```
 */
export async function loadRewriteRules(filePath: string): Promise<RewriteRules> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const rules = JSON.parse(content) as unknown;

    if (typeof rules !== 'object' || rules === null || Array.isArray(rules)) {
      throw new Error('Routes file must contain a JSON object with route mappings');
    }

    // Validate all keys and values are strings
    for (const [key, value] of Object.entries(rules)) {
      if (typeof value !== 'string') {
        throw new Error(`Route mapping for '${key}' must be a string, got ${typeof value}`);
      }
    }

    return rules as RewriteRules;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Routes file must contain')) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to load routes from '${filePath}': ${message}\n` +
        `\nExpected format:\n` +
        `{\n` +
        `  "/api/*": "/$1",\n` +
        `  "/users/:id": "/api/users/:id"\n` +
        `}\n` +
        `\nSee examples/routes.json for more examples.`
    );
  }
}

/**
 * Convert a route pattern with wildcards and parameters to a RegExp
 *
 * @param pattern - Route pattern (e.g., '/api/*', '/posts/:id')
 * @returns Regular expression and parameter names
 *
 * @example
 * ```typescript
 * const { regex, params } = patternToRegex('/api/*');
 * // regex: /^\/api\/(.*)$/
 * // params: ['$1']
 *
 * const { regex, params } = patternToRegex('/posts/:id/comments/:commentId');
 * // regex: /^\/posts\/([^\/]+)\/comments\/([^\/]+)$/
 * // params: ['id', 'commentId']
 * ```
 */
function patternToRegex(pattern: string): { regex: RegExp; params: string[] } {
  const params: string[] = [];
  let wildcardCount = 0;

  // Escape special regex characters except * and :
  let regexPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

  // Replace :param with capturing group and collect param names
  regexPattern = regexPattern.replace(/:([^/]+)/g, (_match, param: string) => {
    params.push(param);
    return '([^/]+)';
  });

  // Replace * with capturing group (supports multiple wildcards)
  regexPattern = regexPattern.replace(/\*/g, () => {
    wildcardCount++;
    params.push(`$${String(wildcardCount)}`);
    return '(.*?)';
  });

  return {
    regex: new RegExp(`^${regexPattern}$`),
    params,
  };
}

/**
 * Rewrite a URL based on a pattern and substitution
 *
 * @param url - Original URL
 * @param fromPattern - Pattern to match (with * or :param)
 * @param toPattern - Target pattern with $1, $2, etc. or :param
 * @returns Rewritten URL or null if pattern doesn't match
 *
 * @example
 * ```typescript
 * rewriteUrl('/api/posts', '/api/*', '/$1')      // → '/posts'
 * rewriteUrl('/me', '/me', '/profile')           // → '/profile'
 * rewriteUrl('/posts/1', '/posts/:id', '/items/:id')  // → '/items/1'
 * ```
 */
function rewriteUrl(url: string, fromPattern: string, toPattern: string): string | null {
  // Separate the path and query string
  const splitResult = url.split('?', 2);
  const urlPath = splitResult[0] ?? '';
  const queryString = splitResult[1];
  
  const { regex, params } = patternToRegex(fromPattern);
  const match = urlPath.match(regex);

  if (!match) {
    return null;
  }

  // Extract captured values
  const captures = match.slice(1);

  // Build the replacement URL
  let result = toPattern;

  // Replace $1, $2, etc. with captured values
  for (let i = 0; i < captures.length; i++) {
    const value = captures[i];
    if (value !== undefined) {
      result = result.replace(`$${String(i + 1)}`, value);
    }
  }

  // Replace :param with captured values (for named parameters)
  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    const value = captures[i];
    if (param && !param.startsWith('$') && value !== undefined) {
      result = result.replace(`:${param}`, value);
    }
  }

  // Append query string if present
  if (queryString) {
    result += '?' + queryString;
  }

  return result;
}

/**
 * Create Express middleware that rewrites URLs based on rules
 *
 * @param rules - Route rewrite rules
 * @returns Express middleware function
 *
 * @example
 * ```typescript
 * const rules = {
 *   '/api/*': '/$1',
 *   '/me': '/profile',
 *   '/posts/:category': '/posts?category=:category'
 * };
 *
 * const rewriter = createRewriterMiddleware(rules);
 * app.use(rewriter);
 * ```
 */
export function createRewriterMiddleware(rules: RewriteRules): RequestHandler {
  return (req, _res, next) => {
    // Try each rule in order
    for (const [from, to] of Object.entries(rules)) {
      const rewritten = rewriteUrl(req.url, from, to);

      if (rewritten !== null) {
        req.url = rewritten;
        break; // Apply only the first matching rule
      }
    }

    next();
  };
}
