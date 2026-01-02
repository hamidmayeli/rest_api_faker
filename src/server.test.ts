import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { resolve } from 'path';
import { Database } from './database';
import { createServer } from './server';
import { Express } from 'express';

describe('Server Special Endpoints', () => {
  let db: Database;
  let app: Express;
  const testDbPath = resolve(__dirname, '../test-server-db.json');

  beforeAll(async () => {
    // Create temporary database file
    const initialData = {
      users: [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
      ],
      posts: [
        { id: 1, userId: 1, title: 'First Post', body: 'Hello World' },
        { id: 2, userId: 1, title: 'Second Post', body: 'Another post' },
        { id: 3, userId: 2, title: "Bob's Post", body: "Bob's content" },
      ],
    };

    writeFileSync(testDbPath, JSON.stringify(initialData));

    // Create database
    db = new Database(testDbPath);
    await db.init();

    app = await createServer(db, { quiet: true });
  });

  afterAll(() => {
    // Clean up test database
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  describe('GET /db', () => {
    it('should return the full database', async () => {
      const response = await request(app).get('/db');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('posts');
      expect((response.body as Record<string, unknown[]>).users).toHaveLength(2);
      expect((response.body as Record<string, unknown[]>).posts).toHaveLength(3);
    });

    it('should return JSON content type', async () => {
      const response = await request(app).get('/db');

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should include all collections', async () => {
      const response = await request(app).get('/db');

      expect(Object.keys(response.body as Record<string, unknown>)).toContain('users');
      expect(Object.keys(response.body as Record<string, unknown>)).toContain('posts');
    });
  });

  describe('GET / (Homepage)', () => {
    it('should return HTML homepage', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/html/);
      expect(response.text).toContain('API Faker');
    });

    it('should include link to /db endpoint', async () => {
      const response = await request(app).get('/');

      expect(response.text).toContain('/db');
    });

    it('should include usage tips', async () => {
      const response = await request(app).get('/');

      expect(response.text).toContain('query parameters');
    });
  });

  describe('Static File Integration', () => {
    it('should still handle 404 for non-existent routes', async () => {
      const response = await request(app).get('/nonexistent-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should not interfere with API routes', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should not interfere with nested routes', async () => {
      const response = await request(app).get('/users/1');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ id: 1, name: 'Alice' });
    });
  });

  describe('Server Options', () => {
    it('should support disabled static serving', async () => {
      const appNoStatic = await createServer(db, { enabled: false, quiet: true });
      const response = await request(appNoStatic).get('/');

      expect(response.status).toBe(200);
      expect(response.text).toContain('API Faker');
    });

    it('should support custom static directory', async () => {
      const appCustom = await createServer(db, { directory: './custom', quiet: true });
      const response = await request(appCustom).get('/users');

      // Should still work with custom directory
      expect(response.status).toBe(200);
    });
  });
});
