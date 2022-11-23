function setUpRoutes(app, communicationHandler, userHandler) {
  app.post("/messages", (req, res) => {
    const message = {
      author: req.body.author,
      content: req.body.content,
      type: req.body.type,
    };

    const namespaceName = userHandler.getNamespaceNameFrom(message.author);
    if (namespaceName) {
      const nsp = communicationHandler.getNamespaceFrom(namespaceName);
      if (nsp) {
        nsp.emit("message-sent", message);
      }
    }
  
    res.status(204).end();
  });
}

module.exports = { setUpRoutes };