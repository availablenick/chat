require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const fileUpload = require('express-fileupload');

const allowedURLS = process.env.ALLOWED_URLS.split(",");
const port = 3000;
const app = express();
app.use(express.json());
app.use(fileUpload());
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: allowedURLS },
});

const users = {};
const namespaceNames = {};

app.post("/messages", (req, res) => {
  let content = "";
  switch (req.body.type) {
    case "text":
      content = req.body.content;
      break;
    case "image":
      const file = req.files.content;
      content = `data:${file.mimetype};base64,${file.data.toString("base64")}`;
      break;
    case "video":
      content = req.body.content;
      break;
    default:
      return res.status(400).end();
  }

  const message = {
    author: req.body.author,
    content: content,
    type: req.body.type,
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
    socket.broadcast.emit("user-joined", user);
  });

  socket.on("message-sent", (message) => {
    socket.nsp.emit("message-sent", message);
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      socket.nsp.emit("user-left", { name: users[socket.id].username });
      delete users[socket.id];
    }
  })
});

httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
