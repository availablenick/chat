const request = require("supertest");
const { createServer } = require("http");
const Client = require("socket.io-client");
const app = require("./app");
const { setUpRoutes } = require("./routes");
const CommunicationService = require("./communication.service");
const UserService = require("./user.service");

describe("global chat", () => {
  let communicationHandler, httpServer, sockets;

  beforeAll(() => {
    sockets = [];
    httpServer = createServer(app);
    const userHandler = new UserService();
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
    sockets.forEach((socket) => {
      socket.removeAllListeners();
      socket.disconnect();
    });
  });

  test("users are notified when someone joins the chat", (done) => {
    const port = httpServer.address().port;
    const socket1 = Client(`http://localhost:${port}/`);
    const socket2 = Client(`http://localhost:${port}/`);
    sockets.push(socket1, socket2);

    socket1.once("connect", () => {
      socket1.once("user-joined", (username) => {
        expect(username).toBe("test_username2");
        done();
      });
    });

    socket2.once("connect", () => {
      socket2.emit("user-joined", "test_username2");
    });
  });

  test("users receive list of connected users when they join the chat", (done) => {
    const port = httpServer.address().port;
    const socket1 = Client(`http://localhost:${port}/`);
    const socket2 = Client(`http://localhost:${port}/`);
    sockets.push(socket1, socket2);

    socket1.once("connect", () => {
      socket1.emit("user-joined", "test_username1");
    });

    socket2.once("connect", () => {
      socket2.once("user-joined", () => {
        socket2.emit("user-joined", "test_username2", (usernames) => {
          expect(usernames).toContain("test_username1");
          done();
        });
      });
    });
  });

  test("users are notified when someone disconnects", (done) => {
    const port = httpServer.address().port;
    const socket1 = Client(`http://localhost:${port}/`);
    const socket2 = Client(`http://localhost:${port}/`);
    sockets.push(socket1, socket2);

    socket1.once("connect", () => {
      socket1.once("user-joined", () => {
        socket2.disconnect();
      });

      socket1.once("user-left", (username) => {
        expect(username).toBe("test_username2");
        done();
      });

      socket1.emit("user-joined", "test_username1");
    });

    socket2.once("connect", () => {
      socket2.emit("user-joined", "test_username2");
    });
  });

  test("POST /messages with text type message works", (done) => {
    const message = {
      author: "test_author1",
      content: "test_content",
      type: "text",
    };

    const port = httpServer.address().port;
    const socket1 = Client(`http://localhost:${port}/`);
    const socket2 = Client(`http://localhost:${port}/`);
    sockets.push(socket1, socket2);

    socket1.once("connect", () => {
      socket1.once("user-joined", () => {
        request(httpServer)
          .post('/messages')
          .send(message)
          .expect(204)
          .end((err) => {
            if (err) {
              return done(err);
            }
          });
      });

      socket1.once("message-sent", (data) => {
        expect(data).toMatchObject(message);
        done();
      });

      socket1.emit("user-joined", "test_author1");
    });

    socket2.once("connect", () => {
      socket2.emit("user-joined", "test_author2");
    });
  });

  test("POST /messages with image type message works", (done) => {
    const message = {
      author: "test_author1",
      content: "https://example.com/image.png",
      type: "image",
    };
    
    const port = httpServer.address().port;
    const socket1 = Client(`http://localhost:${port}/`);
    const socket2 = Client(`http://localhost:${port}/`);
    sockets.push(socket1, socket2);

    socket1.once("connect", () => {
      socket1.once("user-joined", () => {
        request(httpServer)
          .post('/messages')
          .send(message)
          .expect(204)
          .end((err) => {
            if (err) {
              return done(err);
            }
          });
      });

      socket1.once("message-sent", (data) => {
        expect(data).toMatchObject(message);
        done();
      });

      socket1.emit("user-joined", "test_author1");
    });

    socket2.once("connect", () => {
      socket2.emit("user-joined", "test_author2");
    });
  });

  test("POST /messages with video type message works", (done) => {
    const message = {
      author: "test_author1",
      content: "https://example.com/video.mp4",
      type: "video",
    };
    
    const port = httpServer.address().port;
    const socket1 = Client(`http://localhost:${port}/`);
    const socket2 = Client(`http://localhost:${port}/`);
    sockets.push(socket1, socket2);

    socket1.once("connect", () => {
      socket1.once("user-joined", () => {
        request(httpServer)
          .post('/messages')
          .send(message)
          .expect(204)
          .end((err) => {
            if (err) {
              return done(err);
            }
          });
      });

      socket1.once("message-sent", (data) => {
        expect(data).toMatchObject(message);
        done();
      });

      socket1.emit("user-joined", "test_author1");
    });

    socket2.once("connect", () => {
      socket2.emit("user-joined", "test_author2");
    });
  });

  test("POST /messages returns 422 status code when user is not in the chat", (done) => {
    const message = {
      author: "test_author",
      content: "test_content",
      type: "text",
    };

    request(httpServer)
      .post('/messages')
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
