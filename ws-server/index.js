require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const allowedURLS = process.env.ALLOWED_URLS.split(",");
const port = 3000;
const app = express();
app.use(express.json());
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: allowedURLS },
});

const users = {};
const namespaceNames = {};

app.post("/messages", (req, res) => {
  const message = {
    author: req.body.author,
    content: req.body.content,
  };

  if (namespaceNames[message.author]) {
    const nsp = io.of(namespaceNames[message.author]);
    if (nsp) {
      nsp.emit("message-sent", message);
    }
  }

  res.status(204).end();
});

io.of(/\/main/).on("connection", (socket) => {
  socket.on("user-joined", (user) => {
    users[socket.id] = { username: user.name };
    namespaceNames[user.name] = socket.nsp.name;
    // const data = Object.values(users).map((user) => ({ name: user.username }));
    socket.broadcast.emit("user-joined", user);
    // socket.nsp.emit("user-joined", user);
  });

  socket.on("message-sent", (message) => {
    socket.nsp.emit("message-sent", message);
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      // const data = Object.values(users).map((user) => ({ name: user.username }));
      socket.nsp.emit("user-left", { name: users[socket.id].username });
      delete users[socket.id];
    }
  })
});

httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
