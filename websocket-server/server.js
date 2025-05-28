const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid'); // vamos a usar uuid para ids

const wss = new WebSocket.Server({ port: 8080 });
console.log('Servidor WebSocket corriendo en ws://192.168.0.109:8080');

wss.on('connection', (ws) => {
  console.log('Nuevo cliente conectado');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      // Validamos que venga con id, sender y text
      if (data.type === 'chat_message' && data.id && data.sender && data.text) {
        // Reenviamos a todos clientes el mismo mensaje, con id y todo
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      } else {
        console.log('Mensaje recibido sin formato válido:', data);
      }
    } catch (err) {
      console.error('Mensaje inválido:', err.message);
    }
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});
