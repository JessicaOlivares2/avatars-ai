const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080, host: '0.0.0.0' }, () => {
  console.log('Servidor WebSocket iniciado en ws://0.0.0.0:8080');
});

const clients = new Map(); // ws -> userId

wss.on('connection', (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`Cliente conectado desde ${clientIP}`);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('Mensaje recibido:', message);

      switch (message.type) {
        case 'user_connected':
          clients.set(ws, message.userId);
          console.log(`Usuario conectado: ${message.userId} desde ${clientIP}`);
          break;

        case 'chat_message':
          broadcast(message, ws);
          break;

        case 'reaction':
          broadcast(message, ws);
          break;

        default:
          console.warn('Tipo de mensaje desconocido:', message.type);
      }
    } catch (err) {
      console.error('Error procesando mensaje:', err);
    }
  });

  ws.on('close', () => {
    const userId = clients.get(ws) || 'Desconocido';
    console.log(`Cliente desconectado: ${userId} (${clientIP})`);
    clients.delete(ws);
  });
});

function broadcast(message, senderWs) {
  for (const client of wss.clients) {
    if (client !== senderWs && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}
