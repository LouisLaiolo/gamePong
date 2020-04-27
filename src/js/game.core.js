var requestAnimId;
var room;
var gameInit = function (r) {
  // le code de l'initialisation
  room = r
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
  if (game.ball.inGame && game.playerOne.amI)
    socket.emit("ball", {x: game.ball.sprite.posX, y: game.ball.sprite.posY },
    );
};

var scoreCheck = function () {
  if (game.ball.lost(game.playerOne))
    socket.emit("score", {
      roomId: this.newPong.getGameId(),
      player: "playerOne",
      score: {
        playerOne: game.playerOne.score,
        playerTwo: game.playerTwo.score,
      },
    });
  else if (game.ball.lost(game.playerTwo))
    socket.emit("score", {
      roomId: this.newPong.getGameId(),
      player: "playerTwo",
      score: {
        playerOne: game.playerOne.score,
        playerTwo: game.playerTwo.score,
      },
    });
};

let pong = game;
let newPong;
let player;

//creation du joueur 1 de gauche
//document.getElementById('createGame').onclick = ()=> {
//game.oneVSone=true;
//socket.emit('playPongTwo', {nbPlayer : 2});
//player = new Player('left');
//};

/*document.getElementById('createGameIA').onclick = ()=>{
        game.iaGame = true;
        game.playerOne.amI = true;
        document.getElementById('menu').style.display = 'none';
        document.getElementById('completGame').style.display = 'block';
        document.getElementById('startGame').disabled = false;
        document.getElementById('message').textContent = 'Enjoy your game !'
        initialisation();
    };*/

/*document.getElementById('createGame2vs2').onclick = ()=>{
    game.twoVStwo = true;
    socket.emit('playPongFour', {nbPlayer : 4});
};*/

// Creation de la partie par P1
socket.on("newGame", (data) => {
  let message;
  message = `Game ID : ${data.roomId} ! Waiting a second player ...`;
  this.newPong = new Game(data.roomId);
  this.newPong.displayGame(message);
  game.playerOne.isSelected = true;
});

//rejoindre une partie
/*document.getElementById('joinGame').onclick = () => {
    const roomID = document.getElementById('RoomName').value;
    if (!roomID) {
        alert('Please enter the name of the game.');
        return;
    }
    if(!game.twoVStwo){
        socket.emit('joinGame', {roomId: roomID, places : 2});
        //player = new Player('right');
    }
    else{
        socket.emit('joinGame', {roomId: roomID, places : 4});
    }
    
};*/

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
