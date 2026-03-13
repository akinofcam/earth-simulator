import express from 'express';
import path from 'path';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import app from './app';
import { getConnection } from '../db/connection';
import { startIngestionLoop } from '../ingest';
import { initWebSocketServer } from '../stream/wsPubsub';

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

initWebSocketServer(wss);

app.use(express.static(path.join(__dirname, '../../src/client')));

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'welcome', message: 'Earth Simulator WS connected' }));

  socket.on('message', (data) => {
    try {
      const payload = JSON.parse(data.toString());
      console.log('WS message', payload);
      if (payload.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      }
    } catch (error) {
      console.error(error);
    }
  });
});

const PORT = Number(process.env.PORT || 4000);

httpServer.listen(PORT, async () => {
  console.log(`Server running http://localhost:${PORT}`);
  await getConnection();
  await startIngestionLoop();
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
