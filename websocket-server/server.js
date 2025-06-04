const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocket.Server({ port: 8080, host: '0.0.0.0' });
console.log('Servidor WebSocket corriendo en 0.0.0.0:8080');

wss.on('connection', (ws) => {
  console.log('Nuevo cliente conectado');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'chat_message':
          if (data.sender && data.text) {
            const messageWithId = { ...data, id: uuidv4() };

            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(messageWithId));
              }
            });
          } else {
            console.log('chat_message sin datos necesarios:', data);
          }
          break;

        case 'user_connected':
          if (data.userId) {
            console.log(`Usuario conectado: ${data.userId}`);
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
              }
            });
          } else {
            console.log('user_connected sin userId:', data);
          }
          break;

        default:
          console.log('Tipo de mensaje no reconocido:', data);
      }
    } catch (err) {
      console.error('Mensaje inválido:', err.message);
    }
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});
