const { Server } = require("socket.io");

class CommunicationService {
  constructor(userHandler) {
    this.userHandler = userHandler;
  }

  init(httpServer, config = {}) {
    this.io = new Server(httpServer, config);
    this.io.of(/\/main/).on("connection", (socket) => {
      this.setUpListeners(socket, this.userHandler);
    });
  }

  terminate() {
    this.io.close();
  }

  getNamespaceFrom(namespaceName) {
    return this.io.of(namespaceName);
  }

  setUpListeners(socket) {
    socket.on("user-joined", (user) => {
      this.userHandler.assignUserToId({ username: user.name }, socket.id);
      this.userHandler.assignUsernameToNamespaceName(user.name, socket.nsp.name);
      socket.broadcast.emit("user-joined", user);
    });
  
    socket.on("disconnect", () => {
      const user = this.userHandler.getUserFrom(socket.id);
      if (user) {
        socket.nsp.emit("user-left", { name: user.username });
        this.userHandler.removeUser(socket.id);
      }
    });
  }
}

module.exports = CommunicationService;
