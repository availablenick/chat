function setUpRoutes(app, communicationHandler, userHandler) {
  app.post("/messages", (req, res) => {
    const message = {
      author: req.body.author,
      content: req.body.content,
      type: req.body.type,
    };

    const namespaceName = userHandler.getNamespaceNameFrom(message.author);
    if (!namespaceName) {
      return res.status(422).end();
    }

    const nsp = communicationHandler.getNamespaceFrom(namespaceName);
    if (!nsp) {
      return res.status(422).end();
    }

    nsp.emit("message-sent", message);
    res.status(204).end();
  });

  app.post("/private-messages", (req, res) => {
    const message = {
      author: req.body.author,
      content: req.body.content,
      type: req.body.type,
    };

    const namespaceName = userHandler.getNamespaceNameFrom(message.author);
    if (!namespaceName) {
      return res.status(422).end();
    }

    const nsp = communicationHandler.getNamespaceFrom(namespaceName);
    if (!nsp) {
      return res.status(422).end();
    }

    nsp.to(req.body.room).emit("private-message-sent", message, req.body.room);
    res.status(204).end();
  });
}

module.exports = { setUpRoutes };
