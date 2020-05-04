var requestAnimId;
var room;
var gameInit = function (r) {
  // le code de l'initialisation
  room = r;
  game.init();
  requestAnimId = window.requestAnimationFrame(main); // premier appel de main au rafraîchissement de la page
};

var main = function () {
  // le code du jeu
  game.clearLayer(game.playersBallLayer);

  game.movePlayers();
  if (!game.iaGame) sendPosition();
  game.displayPlayers();
  game.moveBall();
  if (!game.iaGame) ballPosition();
  if (game.ball.inGame) {
    game.lostBall();
    if (!game.iaGame) scoreCheck();
  }
  if (game.iaGame) {
    game.ai.move();
  }
  game.collideBallWithPlayersAndAction();
  requestAnimId = window.requestAnimationFrame(main); // rappel de main au prochain rafraîchissement de la page
};

var sendPosition = function () {
  if (game.playerOne.goDown || game.playerOne.goUp)
    socket.emit("playerMove", game.playerOne.sprite.posY);
  else if (game.playerTwo.goDown || game.playerTwo.goUp)
    socket.emit("playerMove", game.playerTwo.sprite.posY);
};

var ballPosition = function () {
  if (game.ball.inGame)
    socket.emit("ball", {
      speed: game.ball.speed,
      source: game.playerOne.amI ? "player1" : "player2",
      x: game.ball.sprite.posX,
      y: game.ball.sprite.posY,
    });
};

var scoreCheck = function () {};

let pong = game;
let newPong;
let player;

// Creation de la partie par P1
socket.on("newGame", (data) => {
  let message;
  message = `Game ID : ${data.roomId} ! Waiting a second player ...`;
  this.newPong = new Game(data.roomId);
  this.newPong.displayGame(message);
  game.playerOne.isSelected = true;
});

socket.on("playerOne", (data) => {
  game.playerOne.amI = true;
  game.playerTwo.isSelected = true;
  initialisation();
  this.newPong.displayGame("Game Id : " + data.roomId);
});

socket.on("newPlayer", (data) => {
  if (data.player == 2) game.playerTwo.isSelected = true;
  else if (data.player == 3) game.playerThree.isSelected = true;
  else if (data.player == 4) {
    game.playerFour.isSelected = true;
    initialisation();
    this.newPong.displayGame("Game Id : " + data.roomId);
  }
});

socket.on("playerTwo", (data) => {
  this.newPong = new Game(data.roomId);
  this.newPong.displayGame("Game Id : " + data.roomId);
  document.getElementById("startGame").disabled = false;
  game.playerOne.isSelected = true;
  game.playerTwo.isSelected = true;
  game.playerTwo.amI = true;
  initialisation();
});

socket.on("playerOnemove", (data) => {
  game.playerOne.sprite.posY = data.posY;
});

socket.on("playerTwomove", (data) => {
  game.playerTwo.sprite.posY = data.posY;
});

socket.on("ballmove", (balle) => {
  console.log(balle.speed);
  console.log("ball is moving");
  game.ball.speed = balle.speed;
  game.ball.sprite.posX = balle.x;
  game.ball.sprite.posY = balle.y;
});

socket.on("scoreUpdate", (data) => {
  if (data.player === "playerOne") {
    game.playerOne.engaging = true;
  } else if (data.player === "playerTwo") {
    game.playerTwo.engaging = true;
  }
  game.playerOne.score = data.score.playerOne;
  game.playerTwo.score = data.score.playerTwo;
  game.scoreLayer.clear();
  game.displayScore(game.playerOne.score, game.playerTwo.score);
  if (game.playerOne.amI && game.playerOne.score === "V") {
    game.gameOn = false;
    document.getElementById("messageWaiting").textContent =
      "Click Ready to restart a game !";
    document.getElementById("messageWaiting").style.display = "block";
    document.getElementById("startGame").disabled = false;
    game.playerOne.ready = false;
    game.playerTwo.ready = false;
    game.beginingP1 = false;
    game.beginingP2 = false;
  } else if (game.playerTwo.amI && game.playerTwo.score === "V") {
    game.gameOn = false;
    document.getElementById("messageWaiting").textContent =
      "Click Ready to restart a game !";
    document.getElementById("messageWaiting").style.display = "block";
    document.getElementById("startGame").disabled = false;
    game.playerTwo.ready = false;
    game.playerOne.ready = false;
    game.beginingP1 = false;
    game.beginingP2 = false;
  }
});

socket.on("score", (data) => {
  game.playerOne.score = data.player1;
  game.playerTwo.score = data.player2;
  game.clearLayer(game.scoreLayer);
  game.displayScore(game.playerOne.score, game.playerTwo.score);
});

socket.on("gotBallInHand", (data) => {
  console.log("GOT BALL IN HAND ! ");
  game.ball.directionX = -game.ball.directionX;
  game.ball.sprite.posX =
    game[game.playerOne.amI ? "playerOne" : "playerTwo"].sprite.posX +
    game[game.playerOne.amI ? "playerOne" : "playerTwo"].sprite.width;
  game.ball.sprite.posY =
    game[game.playerOne.amI ? "playerOne" : "playerTwo"].sprite.posY;
});

socket.on("playerReady", (data) => {
  if (data.player === "playerOne") game.beginingP1 = true;
  if (data.player === "playerTwo") game.beginingP2 = true;
  if (game.beginingP1 && game.beginingP2) {
    document.getElementById("messageWaiting").textContent = "";
    document.getElementById("messageWaiting").style.display = "none";
    document.getElementById("startGame").disabled = true;
    game.reinitGame();
    game.gameOn = true;
    game.beginingP1 = false;
    game.beginingP2 = false;
  }
});

class Game {
  constructor(roomId) {
    this.roomId = roomId;
  }
  displayGame(message) {
    document.getElementById("menu").style.display = "none";
    document.getElementById("completGame").style.display = "block";
    document.getElementById("message").textContent = message;
  }
  getGameId() {
    return this.roomId;
  }
}

class Player {
  constructor(position) {
    this.position = position;
  }
  getPlayerPosition() {
    return this.position;
  }
}
