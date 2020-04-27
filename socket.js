var joueurs = {};
var gameRoomTwo = "versus";
var gameRoomFour = "confused";

module.exports = function (io) {
  io.on("connection", (client) => {
    io.emit("list_joueurs", joueurs);

    client.on("login_register", (data) => {
      //recuperer le pseudo apres input
      var username = data.username;
      joueurs[client.id] = {
        //nom: client.handshake.query["nom"],
        nom: username,
      };
      if (typeof username === "undefined" || username === null)
        client.emit("invalid");
      else client.emit("logged_in");

      io.emit("list_joueurs", joueurs);
    });

    client.on("playPongTwo", () => {
      client.join(this.gameRoomTwo);
      client.emit("newGame", { roomId: `${2}` });
    });

    client.on("playPongFour", (data) => {
      client.join(this.gameRoomFour);
      client.emit("newGame", { roomId: `${4}` });
    });

    client.on("disconnect", () => {
      console.log("un client sest déco");
      delete joueurs[client.id];
      client.emit("list_joueurs", joueurs);
    });

    client.on("playerMove", (data) => {
      if (data.player === "playerOne")
        client.broadcast
          .to(data.roomId)
          .emit("playerOnemove", { posY: data.posY });
      else if (data.player === "playerTwo")
        client.broadcast
          .to(data.roomId)
          .emit("playerTwomove", { posY: data.posY });
    });

    client.on("ball", (data) => {
      client.broadcast.to(data.roomId).emit("ballmove", {
        position: { posX: data.position.posX, posY: data.position.posY },
      });
    });

    client.on("score", (data) => {
      client.broadcast.to(data.roomId).emit("scoreUpdate", {
        player: data.player,
        score: { player1: data.score.player1, player2: data.score.player2 },
      });
    });

    client.on("ready", (data) => {
      client.emit("playerReady", { player: data.player });
      client.broadcast
        .to(data.roomId)
        .emit("playerReady", { player: data.player });
    });
  });
};
