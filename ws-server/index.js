require("dotenv").config();
const { createServer } = require("http");
const app = require("./src/app");
const { setUpRoutes } = require("./src/routes");
const CommunicationService = require("./src/communication.service");
const UserService = require("./src/user.service");

const allowedURLS = process.env.ALLOWED_URLS.split(",");
const port = 3000;

const httpServer = createServer(app);
const userHandler = new UserService();
const communicationHandler = new CommunicationService(userHandler);
communicationHandler.init(httpServer, {
  cors: { origin: allowedURLS },
});

setUpRoutes(app, communicationHandler, userHandler);

httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
