const express = require('express');
const http = require('http');
const cors = require("cors");
const bodyParser = require('body-parser');

const app = express();
const corsOptions = {
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  };
  
app.use(cors(corsOptions));
app.use(bodyParser.json()); 
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
      origin: 'http://localhost:4200',
      // origin: 'http://127.0.0.1:5500',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
// Kênh (channel)
const channelA = 'channelA';
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('joinChannel', () => {
        socket.join('channelA');
        console.log('User joined channel A');
    });

      // Lắng nghe sự kiện joinChannel từ client
  socket.on('joinChannel', (channel) => {
    console.log(`Client joined channel: ${channel}`);

    // Lắng nghe tin nhắn từ client trong channel cụ thể
    socket.on(channel, (message) => {
      console.log(`Received message from ${channel}: ${message}`);
      // Xử lý tin nhắn ở đây và có thể gửi lại cho tất cả các client trong channel
      io.to(channel).emit('message', `Received message from ${channel}: ${message}`);
    });

    // Tham gia vào channel cụ thể
    socket.join(channel);
  });

    // Khi người dùng ngắt kết nối
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
  });

// API endpoint để gửi tin nhắn vào channel
app.post('/api/send-message/:channel', (req, res) => {
  const { channel } = req.params;
  const { message } = req.body;

  // Gửi tin nhắn vào channel cụ thể
  io.to(channel).emit('message', message);

  res.json({ success: true, message: 'Message sent successfully' });
});

// Định cổng và bắt đầu lắng nghe
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('WebSocket server initialization successful');
});