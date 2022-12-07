function setUpRoutes(app, communicationHandler, userHandler) {
  app.post("/messages", (req, res) => {
    const message = {
      author: req.body.author,
      content: req.body.content,
      type: req.body.type,
    };

    if (!userHandler.hasUser(message.author)) {
      return res.status(422).end();
    }

    communicationHandler.sendMessage(message, req.body.room);
    res.status(204).end();
  });
}

module.exports = { setUpRoutes };
