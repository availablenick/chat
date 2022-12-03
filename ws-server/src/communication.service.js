const { Server } = require("socket.io");

class CommunicationService {
  constructor(userHandler) {
    this.userHandler = userHandler;
  }

  init(httpServer, config = {}) {
    this.io = new Server(httpServer, config);
    this.io.on("connection", (socket) => {
      this.setUpListeners(socket, this.userHandler);
    });
  }

  terminate() {
    this.io.close();
  }

  sendMessageSentEvent(message) {
    this.io.emit("message-sent", message);
  }

  sendPrivateMessageSentEvent(message, room) {
    this.io.to(room).emit("private-message-sent", message, room);
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
        this.userHandler.getRoomsFrom(user.username).forEach((room) => {
          socket.to(room).emit("user-left-room", user.username, room);
          this.removeSocketsFromRoom(room, (s) => {
            const remainingUsername = this.userHandler.getUserFrom(s.id).username;
            this.userHandler.removeUserPairRoom(user.username, remainingUsername);
          });
        });

        this.userHandler.removeUser(socket.id);
        socket.nsp.emit("user-left", { name: user.username });
      }
    });

    socket.on("invite", (invitedUsername, callback) => {
      const invitingUsername = this.userHandler.getUserFrom(socket.id).username;
      if (invitingUsername === invitedUsername) {
        return;
      }

      if (this.userHandler.hasRoomForPair(invitingUsername, invitedUsername)) {
        callback(null);
        return;
      }

      const roomId = this.userHandler.assignRoomToUserPair(invitingUsername, invitedUsername);
      const userSocket = this.getSocket(invitedUsername, socket.nsp);
      socket.join(roomId);
      userSocket.join(roomId);
      userSocket.emit("invite", invitingUsername, roomId);
      callback(roomId);
    });

    socket.on("user-left-room", (username, roomId) => {
      if (!roomId) {
        throw new Error("Parameter roomId is undefined");
      }

      socket.to(roomId).emit("user-left-room", username, roomId);
      socket.leave(roomId);
      this.removeSocketsFromRoom(roomId, (socket) => {
        const remainingUsername = this.userHandler.getUserFrom(socket.id).username;
        this.userHandler.removeUserPairRoom(username, remainingUsername);
      });
    });
  }

  async removeSocketsFromRoom(room, callback) {
    const sockets = await this.io.of("/").in(room).fetchSockets();
    sockets.forEach((socket) => {
      socket.leave(room);
      callback(socket);
    });
  }

  getSocket(username, namespace) {
    return namespace.sockets.get(this.userHandler.getIdFrom(username));
  }
}

module.exports = CommunicationService;
