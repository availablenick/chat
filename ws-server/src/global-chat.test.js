const request = require("supertest");
const { createServer } = require("http");
const Client = require("socket.io-client");
const app = require("./app");
const { setUpRoutes } = require("./routes");
const CommunicationService = require("./communication.service");
const UserService = require("./user.service");

describe("client communication", () => {
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
  })

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

      socket1.emit("user-joined", { name: "test_author1" });
    });

    socket2.once("connect", () => {
      socket2.emit("user-joined", { name: "test_author2" });
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

      socket1.emit("user-joined", { name: "test_author1" });
    });

    socket2.once("connect", () => {
      socket2.emit("user-joined", { name: "test_author2" });
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
        socket1.disconnect();
        socket2.disconnect();
        done();
      });

      socket1.emit("user-joined", { name: "test_author1" });
    });

    socket2.once("connect", () => {
      socket2.emit("user-joined", { name: "test_author2" });
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
