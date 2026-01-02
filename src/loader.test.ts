import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Router } from 'express';
import { loadModule, loadRoutes, loadMiddlewares } from './loader';

describe('loader', () => {
  const testDir = join(tmpdir(), 'api-faker-loader-test');

  beforeEach(() => {
    // Create test directory
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('loadModule', () => {
    it('should load a CommonJS module', async () => {
      const filePath = join(testDir, 'test.cjs');
      writeFileSync(filePath, 'module.exports = { value: 42 };');

      const module = await loadModule(filePath) as { default: { value: number }; value: number };
      // Node.js wraps CommonJS exports with both default and named exports
      expect(module.default).toEqual({ value: 42 });
      expect(module.value).toBe(42);
    });

    it('should load an ES module', async () => {
      const filePath = join(testDir, 'test.mjs');
      writeFileSync(filePath, 'export default { value: 42 };');

      const module = await loadModule(filePath) as { default: { value: number } };
      expect(module.default).toEqual({ value: 42 });
    });

    it('should throw error for non-existent file', async () => {
      const filePath = join(testDir, 'nonexistent.js');
      
      await expect(loadModule(filePath)).rejects.toThrow(/Failed to load module/);
    });

    it('should throw error for invalid JavaScript', async () => {
      const filePath = join(testDir, 'invalid.js');
      writeFileSync(filePath, 'this is not valid javascript {{{');

      await expect(loadModule(filePath)).rejects.toThrow(/Failed to load module/);
    });
  });

  describe('loadRoutes', () => {
    it('should load routes from CommonJS module with router modification', async () => {
      const filePath = join(testDir, 'routes.cjs');
      writeFileSync(filePath, `
        module.exports = function(router) {
          router.get('/custom', (req, res) => {
            res.json({ message: 'custom route' });
          });
        };
      `);

      const router = await loadRoutes(filePath);
      expect(router).toBeInstanceOf(Router);
    });

    it('should load routes from ES module that returns router', async () => {
      const filePath = join(testDir, 'routes.mjs');
      writeFileSync(filePath, `
        import { Router } from 'express';
        export default function() {
          const router = Router();
          router.get('/custom', (req, res) => {
            res.json({ message: 'custom route' });
          });
          return router;
        };
      `);

      const router = await loadRoutes(filePath);
      expect(router).toBeInstanceOf(Router);
    });
  });

  describe('loadMiddlewares', () => {
    it('should load single middleware from CommonJS module', async () => {
      const filePath = join(testDir, 'middleware.cjs');
      writeFileSync(filePath, `
        module.exports = function(req, res, next) {
          req.customProp = 'test';
          next();
        };
      `);

      const middlewares = await loadMiddlewares(filePath);
      expect(middlewares).toHaveLength(1);
      expect(typeof middlewares[0]).toBe('function');
    });

    it('should load middleware from ES module default export', async () => {
      const filePath = join(testDir, 'middleware.mjs');
      writeFileSync(filePath, `
        export default function(req, res, next) {
          req.customProp = 'test';
          next();
        };
      `);

      const middlewares = await loadMiddlewares(filePath);
      expect(middlewares).toHaveLength(1);
      expect(typeof middlewares[0]).toBe('function');
    });
  });
});
