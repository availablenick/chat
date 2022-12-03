const request = require("supertest");
const { createServer } = require("http");
const Client = require("socket.io-client");
const app = require("./app");
const { setUpRoutes } = require("./routes");
const CommunicationService = require("./communication.service");
const UserService = require("./user.service");

describe("private rooms", () => {
  let communicationHandler, userHandler, httpServer, sockets;

  beforeAll(() => {
    sockets = [];
    httpServer = createServer(app);
    userHandler = new UserService();
    communicationHandler = new CommunicationService(userHandler);
    communicationHandler.init(httpServer);
    setUpRoutes(app, communicationHandler, userHandler);
    httpServer.listen(0);
  });

  afterAll(() => {
    communicationHandler.terminate();
    httpServer.close();
  });

  beforeEach(() => {
    sockets.length = 0;
  });

  afterEach(() => {
    userHandler.clear();
    sockets.forEach((socket) => {
      socket.removeAllListeners();
      socket.disconnect();
    });
  });

  test("user receives an id for the room when inviting another user", (done) => {
    const port = httpServer.address().port;
    const socket1 = Client(`http://localhost:${port}/`);
    const socket2 = Client(`http://localhost:${port}/`);
    sockets.push(socket1, socket2);

    socket1.once("connect", () => {
      socket1.once("user-joined", () => {
        socket1.emit("invite", "test_user2", (roomId) => {
          expect(typeof roomId).toBe("string");
          done();
        });
      });

      socket1.emit("user-joined", "test_user1");
    });

    socket2.once("connect", () => {
      socket2.emit("user-joined", "test_user2");
    });
  });

  test("user can invite another user to private room", (done) => {
    const port = httpServer.address().port;
    const socket1 = Client(`http://localhost:${port}/`);
    const socket2 = Client(`http://localhost:${port}/`);
    sockets.push(socket1, socket2);

    socket1.once("connect", () => {
      socket1.once("user-joined", () => {
        socket1.emit("invite", "test_user2", () => {});
      });

      socket1.emit("user-joined", "test_user1");
    });

    socket2.once("connect", () => {
      socket2.once("invite", (username, roomId) => {
        expect(username).toBe("test_user1");
        expect(typeof roomId).toBe("string");
        done();
      });

      socket2.emit("user-joined", "test_user2");
    });
  });

  test("user cannot invite themself to private room", (done) => {
    const port = httpServer.address().port;
    const socket1 = Client(`http://localhost:${port}/`);
    sockets.push(socket1);
    const timeoutId = setTimeout(() => { done(); }, 3000);

    socket1.once("connect", () => {
      socket1.once("invite", () => {
        clearTimeout(timeoutId);
        done(new Error("test_user1 should not receive invite event"));
      });

      socket1.emit("user-joined", "test_user1");
      socket1.emit("invite", "test_user1", () => {});
    });
  });

  test("user not invited to private room should not receive invite event", (done) => {
    const port = httpServer.address().port;
    const socket1 = Client(`http://localhost:${port}/`);
    const socket2 = Client(`http://localhost:${port}/`);
    const socket3 = Client(`http://localhost:${port}/`);
    sockets.push(socket1, socket2, socket3);
    const timeoutId = setTimeout(() => { done(); }, 3000);

    socket1.once("connect", () => {
      socket1.on("user-joined", (username) => {
        if (username === "test_user3") {
          socket1.emit("invite", "test_user3", () => {});
        }
      });

      socket1.emit("user-joined", "test_user1");
    });

    socket2.once("connect", () => {
      socket2.once("invite", () => {
        clearTimeout(timeoutId);
        done(Error("test_user2 should not receive invite event"));
      });

      socket2.emit("user-joined", "test_user2");
    });

    socket3.once("connect", () => {
      socket3.emit("user-joined", "test_user3");
    });
  });

  test("user in private room is notified when the other one leaves", (done) => {
    const port = httpServer.address().port;
    const socket1 = Client(`http://localhost:${port}/`);
    const socket2 = Client(`http://localhost:${port}/`);
    sockets.push(socket1, socket2);

    socket1.once("connect", () => {
      socket1.once("user-joined", () => {
        socket1.emit("invite", "test_user2", () => {});
      });

      socket1.once("user-left-room", (username, roomId) => {
        expect(username).toBe("test_user2");
        expect(typeof roomId).toBe("string");
        done();
      });

      socket1.emit("user-joined", "test_user1");
    });

    socket2.once("connect", () => {
      socket2.once("invite", (_, roomId) => {
        socket2.emit("user-left-room", "test_user2", roomId);
      });

      socket2.emit("user-joined", "test_user2");
    });
  });

  test("user in private room is notified when the other one disconnects", (done) => {
    const port = httpServer.address().port;
    const socket1 = Client(`http://localhost:${port}/`);
    const socket2 = Client(`http://localhost:${port}/`);
    sockets.push(socket1, socket2);

    socket1.once("connect", () => {
      socket1.once("user-joined", () => {
        socket1.emit("invite", "test_user2", () => {});
      });

      socket1.once("user-left-room", (username, roomId) => {
        expect(username).toBe("test_user2");
        expect(typeof roomId).toBe("string");
        done();
      });

      socket1.emit("user-joined", "test_user1");
    });

    socket2.once("connect", () => {
      socket2.once("invite", () => {
        socket2.disconnect();
      });

      socket2.emit("user-joined", "test_user2");
    });
  });

  test("user outside a private room is not notified when a user in that room leaves", (done) => {
    const port = httpServer.address().port;
    const socket1 = Client(`http://localhost:${port}/`);
    const socket2 = Client(`http://localhost:${port}/`);
    const socket3 = Client(`http://localhost:${port}/`);
    sockets.push(socket1, socket2, socket3);
    const timeoutId = setTimeout(() => { done(); }, 3000);

    socket1.once("connect", () => {
      socket1.on("user-joined", (username) => {
        if (username === "test_user3") {
          socket1.emit("invite", "test_user3", () => {});
        }
      });

      socket1.emit("user-joined", "test_user1");
    });

    socket2.once("connect", () => {
      socket2.once("user-left-room", () => {
        clearTimeout(timeoutId);
        done(new Error("test_user2 should not receive user-left-room event"));
      });

      socket2.emit("user-joined", "test_user2");
    });

    socket3.once("connect", () => {
      socket3.once("invite", (_, roomId) => {
        socket3.emit("user-left-room", "test_user1", roomId);
      });

      socket3.emit("user-joined", "test_user3");
    });
  });

  test("private room messages sent by inviting user can be seen by invited user", (done) => {
    const port = httpServer.address().port;
    const socket1 = Client(`http://localhost:${port}/`);
    const socket2 = Client(`http://localhost:${port}/`);
    sockets.push(socket1, socket2);

    socket1.once("connect", () => {
      socket1.once("user-joined", () => {
        socket1.emit("invite", "test_user2", () => {});
      });

      socket1.emit("user-joined", "test_user1");
    });

    socket2.once("connect", () => {
      socket2.once("invite", (_, roomId) => {
        const message = {
          author: "test_user1",
          content: "test_content",
          type: "text",
          room: roomId,
        };
  
        request(httpServer)
          .post('/private-messages')
          .send(message)
          .expect(204)
          .end((err) => {
            if (err) {
              return done(err);
            }
          });
      });
  
      socket2.once("private-message-sent", (message, roomId) => {
        expect(message).toMatchObject({
          author: "test_user1",
          content: "test_content",
          type: "text",
        });

        expect(typeof roomId).toBe("string");
        done();
      });

      socket2.emit("user-joined", "test_user2");
    });
  });

  test("private room messages sent by invited user can be seen by inviting user", (done) => {
    const port = httpServer.address().port;
    const socket1 = Client(`http://localhost:${port}/`);
    const socket2 = Client(`http://localhost:${port}/`);
    sockets.push(socket1, socket2);

    socket1.once("connect", () => {
      socket1.once("user-joined", () => {
        socket1.emit("invite", "test_user2", () => {});
      });

      socket1.once("private-message-sent", (message, roomId) => {
        expect(message).toMatchObject({
          author: "test_user2",
          content: "test_content",
          type: "text",
        });

        expect(typeof roomId).toBe("string");
        done();
      });

      socket1.emit("user-joined", "test_user1");
    });

    socket2.once("connect", () => {
      socket2.once("invite", (_, roomId) => {
        const message = {
          author: "test_user2",
          content: "test_content",
          type: "text",
          room: roomId,
        };
  
        request(httpServer)
          .post('/private-messages')
          .send(message)
          .expect(204)
          .end((err) => {
            if (err) {
              return done(err);
            }
          });
      });

      socket2.emit("user-joined", "test_user2");
    });
  });

  test("private room messages cannot be seen by users outside that room", (done) => {
    const port = httpServer.address().port;
    const socket1 = Client(`http://localhost:${port}/`);
    const socket2 = Client(`http://localhost:${port}/`);
    const socket3 = Client(`http://localhost:${port}/`);
    sockets.push(socket1, socket2, socket3);
    const timeoutId = setTimeout(() => { done(); }, 3000);

    socket1.once("connect", () => {
      socket1.on("user-joined", (username) => {
        if (username === "test_user3") {
          socket1.emit("invite", "test_user3", () => {});
        }
      });

      socket1.emit("user-joined", "test_user1");
    });

    socket2.once("connect", () => {
      socket2.once("private-message-sent", () => {
        clearTimeout(timeoutId);
        done(new Error("test_user2 should not receive private-message-sent event"));
      });

      socket2.emit("user-joined", "test_user2");
    });

    socket3.once("connect", () => {
      socket3.once("invite", (_, roomId) => {
        const message = {
          author: "test_user1",
          content: "test_content",
          type: "text",
          room: roomId,
        };
  
        request(httpServer)
          .post('/private-messages')
          .send(message)
          .expect(204)
          .end((err) => {
            if (err) {
              return done(err);
            }
          });
      });

      socket3.emit("user-joined", "test_user3");
    });
  });

  test("user pair can only have one room at a time", (done) => {
    const port = httpServer.address().port;
    const socket1 = Client(`http://localhost:${port}/`);
    const socket2 = Client(`http://localhost:${port}/`);
    sockets.push(socket1, socket2);
    const timeoutId = setTimeout(() => { done(); }, 3000);

    socket1.once("connect", () => {
      socket1.once("user-joined", () => {
        socket1.emit("invite", "test_user2", () => {});
      });

      socket1.emit("user-joined", "test_user1");
    });

    socket2.once("connect", () => {
      socket2.once("invite", () => {
        socket2.once("invite", () => {
          clearTimeout(timeoutId);
          done(Error("test_user2 should not receive two invite events"));
        });

        socket1.emit("invite", "test_user2", () => {});
      });

      socket2.emit("user-joined", "test_user2");
    });
  });

  test("user pair has no room after one of them leaves", (done) => {
    const port = httpServer.address().port;
    const socket1 = Client(`http://localhost:${port}/`);
    const socket2 = Client(`http://localhost:${port}/`);
    sockets.push(socket1, socket2);

    socket1.once("connect", () => {
      socket1.once("user-joined", () => {
        socket1.emit("invite", "test_user2", () => {});
      });

      socket1.once("user-left-room", () => {
        socket1.emit("invite", "test_user2", () => {});
      });

      socket1.emit("user-joined", "test_user1");
    });

    socket2.once("connect", () => {
      socket2.once("invite", (_, roomId) => {
        socket2.once("invite", () => {
          done();
        });

        socket2.emit("user-left-room", "test_user2", roomId);
      });

      socket2.emit("user-joined", "test_user2");
    });
  });

  test("user pair has no room after one of them disconnects", (done) => {
    const port = httpServer.address().port;
    const socket1 = Client(`http://localhost:${port}/`);
    const socket2 = Client(`http://localhost:${port}/`);
    sockets.push(socket1, socket2);

    socket1.once("connect", () => {
      socket1.once("user-joined", () => {
        socket1.emit("invite", "test_user2", () => {});
      });

      socket1.once("user-left-room", () => {
        socket1.once("user-joined", () => {
          socket1.emit("invite", "test_user2", (roomId) => {
            expect(roomId).not.toBe(null);
            done()
          });
        });
      });

      socket1.emit("user-joined", "test_user1");
    });

    socket2.once("connect", () => {
      socket2.once("invite", () => {
        socket2.once("disconnect", () => {
          socket2.once("connect", () => {            
            socket2.emit("user-joined", "test_user2");
          });

          socket2.connect();
        });

        socket2.disconnect();
      });

      socket2.emit("user-joined", "test_user2");
    });
  });

  test("POST /private-messages returns 422 status code when user is not in the chat", (done) => {
    const message = {
      author: "test_author",
      content: "test_content",
      type: "text",
      room: "test_room",
    };

    request(httpServer)
      .post('/private-messages')
      .send(message)
      .expect(422)
      .end((err) => {
        if (err) {
          return done(err);
        }

        return done();
      });
  });
});
