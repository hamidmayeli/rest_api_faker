import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createStaticMiddleware, createHomepageMiddleware } from './static';

describe('Static Server', () => {
  const testDir = resolve(__dirname, '../test-public');
  let app: Express;

  beforeAll(() => {
    // Create test directory and files
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }

    writeFileSync(resolve(testDir, 'index.html'), '<html><body>Index Page</body></html>');
    writeFileSync(resolve(testDir, 'test.txt'), 'Hello World');
    writeFileSync(resolve(testDir, 'test.json'), '{"message":"test"}');
    writeFileSync(resolve(testDir, 'test.css'), 'body { color: red; }');

    // Create nested directory
    mkdirSync(resolve(testDir, 'nested'), { recursive: true });
    writeFileSync(resolve(testDir, 'nested/file.txt'), 'Nested file');

    // Create test app
    app = express();
    app.use(createHomepageMiddleware({ directory: testDir, enabled: true }));
    app.use(createStaticMiddleware({ directory: testDir, enabled: true }));
    app.get('/api/test', (_req, res) => {
      res.json({ test: true });
    });
  });

  afterAll(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Static File Serving', () => {
    it('should serve index.html for root path', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Index Page');
      expect(response.headers['content-type']).toMatch(/html/);
    });

    it('should serve static files', async () => {
      const response = await request(app).get('/test.txt');

      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello World');
      expect(response.headers['content-type']).toMatch(/text\/plain/);
    });

    it('should serve JSON files', async () => {
      const response = await request(app).get('/test.json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'test' });
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should serve CSS files', async () => {
      const response = await request(app).get('/test.css');

      expect(response.status).toBe(200);
      expect(response.text).toBe('body { color: red; }');
      expect(response.headers['content-type']).toMatch(/css/);
    });

    it('should serve files from nested directories', async () => {
      const response = await request(app).get('/nested/file.txt');

      expect(response.status).toBe(200);
      expect(response.text).toBe('Nested file');
    });

    it('should still allow API routes', async () => {
      const response = await request(app).get('/api/test');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ test: true });
    });
  });

  describe('Default Homepage', () => {
    it('should show default homepage when static is disabled', async () => {
      const appNoStatic = express();
      appNoStatic.use(createHomepageMiddleware({ enabled: false }));
      appNoStatic.use(createStaticMiddleware({ enabled: false }));

      const response = await request(appNoStatic).get('/');

      expect(response.status).toBe(200);
      expect(response.text).toContain('API Faker');
      expect(response.text).toContain('/db');
      expect(response.headers['content-type']).toMatch(/html/);
    });

    it('should show default homepage when directory does not exist', async () => {
      const appNoDir = express();
      appNoDir.use(createHomepageMiddleware({ directory: './nonexistent' }));
      appNoDir.use(createStaticMiddleware({ directory: './nonexistent' }));

      const response = await request(appNoDir).get('/');

      expect(response.status).toBe(200);
      expect(response.text).toContain('API Faker');
    });
  });

  describe('Static Middleware Configuration', () => {
    it('should not serve files when disabled', async () => {
      const appDisabled = express();
      appDisabled.use(createStaticMiddleware({ enabled: false }));
      appDisabled.use((_req, res) => {
        res.status(404).json({ error: 'Not Found' });
      });

      const response = await request(appDisabled).get('/test.txt');

      expect(response.status).toBe(404);
    });

    it('should handle custom directory', async () => {
      const customApp = express();
      customApp.use(createStaticMiddleware({ directory: testDir }));

      const response = await request(customApp).get('/test.txt');

      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello World');
    });

    it('should use default directory when not specified', async () => {
      const defaultApp = express();
      defaultApp.use(createStaticMiddleware({}));

      // Should not throw, just pass through
      const response = await request(defaultApp)
        .get('/nonexistent.txt')
        .set('Accept', 'application/json');

      // Since directory doesn't exist, middleware passes through
      expect(response.status).toBe(404);
    });
  });
});
