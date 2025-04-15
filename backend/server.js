const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let latestRate = { ton_usdt: 0, timestamp: Date.now() };

const fetchRate = async () => {
  try {
    const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=toncoin&vs_currencies=usdt');
    latestRate = {
      ton_usdt: res.data.toncoin.usdt,
      timestamp: Date.now(),
    };
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'rate', data: latestRate }));
      }
    });
  } catch (e) {
    console.error('Rate fetch error:', e);
  }
};

setInterval(fetchRate, 2000);

app.get('/api/rate', (req, res) => {
  res.json(latestRate);
});

server.listen(10000, () => console.log('Backend running on port 10000'));
