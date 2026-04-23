import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { logger } from './logger.js';

/**
 * Represents a database change event broadcast to WebSocket clients
 *
 * @example
 * ```typescript
 * const event: DbChangeEvent = {
 *   type: 'create',
 *   resource: 'posts',
 *   data: { id: 4, title: 'New Post' },
 * };
 * ```
 */
export interface DbChangeEvent {
  type: 'create' | 'update' | 'delete';
  resource: string;
  data?: unknown;
  id?: string | number;
}

/**
 * Create a WebSocket server attached to an existing HTTP server
 *
 * @param server - HTTP server instance to attach WebSocket to
 * @returns WebSocketServer instance
 *
 * @example
 * ```typescript
 * const httpServer = app.listen(3000);
 * const wss = createWebSocketServer(httpServer);
 * ```
 */
export function createWebSocketServer(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    logger.debug('WebSocket client connected');
    ws.on('close', () => {
      logger.debug('WebSocket client disconnected');
    });
  });

  return wss;
}

/**
 * Broadcast a database change event to all connected WebSocket clients
 *
 * @param wss - WebSocketServer instance
 * @param event - Database change event to broadcast
 *
 * @example
 * ```typescript
 * broadcast(wss, { type: 'create', resource: 'posts', data: newPost });
 * ```
 */
export function broadcast(wss: WebSocketServer, event: DbChangeEvent): void {
  const message = JSON.stringify(event);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}
