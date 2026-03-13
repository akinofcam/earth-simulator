import { WebSocketServer } from 'ws';

let wss: WebSocketServer | null = null;

export function initWebSocketServer(server: WebSocketServer) {
  wss = server;
}

export function broadcast(message: any) {
  if (!wss) return;
  const payload = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  });
}
