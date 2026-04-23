import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createServer as createHttpServer, Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createWebSocketServer, broadcast, DbChangeEvent } from './websocket.js';
import { Database } from './database.js';
import { createServer } from './server.js';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { resolve } from 'path';
import request from 'supertest';

/**
 * Helper to wait for a WebSocket to reach OPEN state
 */
function waitForOpen(ws: WebSocket): Promise<void> {
  return new Promise((resolve, reject) => {
    if (ws.readyState === WebSocket.OPEN) {
      resolve();
      return;
    }
    ws.on('open', () => {
      resolve();
    });
    ws.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Helper to wait for a WebSocket message
 */
function waitForMessage(ws: WebSocket): Promise<string> {
  return new Promise((resolve, reject) => {
    ws.on('message', (data: import('ws').RawData) => {
      if (Buffer.isBuffer(data)) {
        resolve(data.toString('utf-8'));
      } else if (data instanceof ArrayBuffer) {
        resolve(Buffer.from(data).toString('utf-8'));
      } else if (Array.isArray(data)) {
        resolve(Buffer.concat(data).toString('utf-8'));
      } else {
        resolve('');
      }
    });
    ws.on('error', (err) => {
      reject(err);
    });
  });
}

describe('WebSocket Module', () => {
  describe('createWebSocketServer', () => {
    let httpServer: Server;
    let wss: WebSocketServer;

    beforeEach(() => {
      httpServer = createHttpServer();
      httpServer.listen(0);
      wss = createWebSocketServer(httpServer);
    });

    afterEach(async () => {
      wss.close();
      await new Promise<void>((resolve) => {
        httpServer.close(() => {
          resolve();
        });
      });
    });

    it('should create a WebSocketServer attached to the HTTP server', () => {
      expect(wss).toBeInstanceOf(WebSocketServer);
    });

    it('should accept client connections', async () => {
      const addr = httpServer.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      const client = new WebSocket(`ws://localhost:${String(port)}`);

      await waitForOpen(client);
      expect(client.readyState).toBe(WebSocket.OPEN);

      client.close();
    });
  });

  describe('broadcast', () => {
    let httpServer: Server;
    let wss: WebSocketServer;

    beforeEach(() => {
      httpServer = createHttpServer();
      httpServer.listen(0);
      wss = createWebSocketServer(httpServer);
    });

    afterEach(async () => {
      wss.close();
      await new Promise<void>((resolve) => {
        httpServer.close(() => {
          resolve();
        });
      });
    });

    it('should send event to connected clients', async () => {
      const addr = httpServer.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      const client = new WebSocket(`ws://localhost:${String(port)}`);
      await waitForOpen(client);

      const messagePromise = waitForMessage(client);
      const event: DbChangeEvent = { type: 'create', resource: 'posts', data: { id: 1, title: 'Test' } };
      broadcast(wss, event);

      const received = await messagePromise;
      expect(JSON.parse(received)).toEqual(event);

      client.close();
    });

    it('should send event to multiple clients', async () => {
      const addr = httpServer.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;

      const client1 = new WebSocket(`ws://localhost:${String(port)}`);
      const client2 = new WebSocket(`ws://localhost:${String(port)}`);
      await Promise.all([waitForOpen(client1), waitForOpen(client2)]);

      const msg1 = waitForMessage(client1);
      const msg2 = waitForMessage(client2);

      const event: DbChangeEvent = { type: 'delete', resource: 'users', id: 5 };      broadcast(wss, event);

      const [received1, received2] = await Promise.all([msg1, msg2]);
      expect(JSON.parse(received1)).toEqual(event);
      expect(JSON.parse(received2)).toEqual(event);

      client1.close();
      client2.close();
    });

    it('should not throw when no clients are connected', () => {
      const event: DbChangeEvent = { type: 'update', resource: 'posts', data: { id: 1 }, id: 1 };
      expect(() => {
        broadcast(wss, event);
      }).not.toThrow();
    });
  });

  describe('Integration with Server', () => {
    const testDbPath = resolve(__dirname, '../test-ws-integration-db.json');
    let server: Server;
    let port: number;

    beforeEach(async () => {
      const testData = {
        posts: [
          { id: 1, title: 'Post 1', author: 'Alice' },
          { id: 2, title: 'Post 2', author: 'Bob' },
        ],
        profile: { name: 'John' },
      };
      writeFileSync(testDbPath, JSON.stringify(testData));

      const db = new Database(testDbPath);
      await db.init();
      const app = await createServer(db, { quiet: true });

      // Use port 0 for random available port
      server = app.listen(0);
      const wss = createWebSocketServer(server);
      (app as unknown as Record<string, unknown>)._wss = wss;

      const addr = server.address();
      port = typeof addr === 'object' && addr ? addr.port : 0;
    });

    afterEach(async () => {
      await new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      });
      if (existsSync(testDbPath)) {
        unlinkSync(testDbPath);
      }
    });

    it('should broadcast create events on POST', async () => {
      const client = new WebSocket(`ws://localhost:${String(port)}`);
      await waitForOpen(client);

      const messagePromise = waitForMessage(client);

      // Trigger POST
      await request(`http://localhost:${String(port)}`)
        .post('/posts')
        .send({ title: 'New Post', author: 'Charlie' })
        .set('Content-Type', 'application/json');

      const received = JSON.parse(await messagePromise) as DbChangeEvent;
      expect(received.type).toBe('create');
      expect(received.resource).toBe('posts');
      expect(received.data).toHaveProperty('title', 'New Post');

      client.close();
    });

    it('should broadcast update events on PUT', async () => {
      const client = new WebSocket(`ws://localhost:${String(port)}`);
      await waitForOpen(client);

      const messagePromise = waitForMessage(client);

      await request(`http://localhost:${String(port)}`)
        .put('/posts/1')
        .send({ title: 'Updated Post', author: 'Alice' })
        .set('Content-Type', 'application/json');

      const received = JSON.parse(await messagePromise) as DbChangeEvent;
      expect(received.type).toBe('update');
      expect(received.resource).toBe('posts');
      expect(received.id).toBe('1');

      client.close();
    });

    it('should broadcast update events on PATCH', async () => {
      const client = new WebSocket(`ws://localhost:${String(port)}`);
      await waitForOpen(client);

      const messagePromise = waitForMessage(client);

      await request(`http://localhost:${String(port)}`)
        .patch('/posts/1')
        .send({ title: 'Patched' })
        .set('Content-Type', 'application/json');

      const received = JSON.parse(await messagePromise) as DbChangeEvent;
      expect(received.type).toBe('update');
      expect(received.resource).toBe('posts');

      client.close();
    });

    it('should broadcast delete events on DELETE', async () => {
      const client = new WebSocket(`ws://localhost:${String(port)}`);
      await waitForOpen(client);

      const messagePromise = waitForMessage(client);

      await request(`http://localhost:${String(port)}`).delete('/posts/1');

      const received = JSON.parse(await messagePromise) as DbChangeEvent;
      expect(received.type).toBe('delete');
      expect(received.resource).toBe('posts');
      expect(received.id).toBe('1');

      client.close();
    });

    it('should not broadcast on GET requests', async () => {
      const client = new WebSocket(`ws://localhost:${String(port)}`);
      await waitForOpen(client);

      let received = false;
      client.on('message', () => {
        received = true;
      });

      await request(`http://localhost:${String(port)}`).get('/posts');

      // Wait briefly to confirm no message was sent
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(received).toBe(false);

      client.close();
    });
  });
});
