var game = {
  devResX: 1920,
  devResY: 1080,
  targeResX: null,
  targetResY: null,
  ratioResX: null,
  ratioResY: null,

  blocToCenter: null,
  blocRight: null,
  blocLeft: null,

  groundColor: "#111111",
  netColor: "#AA9A8B",
  groundLayer: null,

  wallSound: null,
  playerSound: null,
  ultimateReward: 2,

  divGame: null,
  divInfo: null,
  gameOn: false,
  startGameButton: null,
  pauseGameButton: null,
  resumeGameButton: null,

  maxGameSpeed: 6.25,

  iaGame: false,

  ball: {
    sprite: null,
    color: "#FFD700",
    directionX: 1,
    directionY: 1,
    speed: 1.75,
    inGame: false,

    move: function () {
      if (this.inGame) {
        this.sprite.posX += this.directionX * this.speed;
        this.sprite.posY += this.directionY * this.speed;
      }
    },

    bounce: function () {
      var audio = null;
      if (
        this.sprite.posX > game.conf.GROUNDLAYERWIDTH ||
        this.sprite.posX < 0
      ) {
        this.directionX = -this.directionX;
        game.randomWallSound();
      }
      if (
        this.sprite.posY + this.sprite.height > game.conf.GROUNDLAYERHEIGHT ||
        this.sprite.posY < 0
      ) {
        this.directionY = -this.directionY;
        game.randomWallSound();
      }
    },

    collide: function (anotherItem) {
      if (
        !(
          this.sprite.posX >=
            anotherItem.sprite.posX + anotherItem.sprite.width ||
          this.sprite.posX <= anotherItem.sprite.posX - this.sprite.width ||
          this.sprite.posY >=
            anotherItem.sprite.posY + anotherItem.sprite.height ||
          this.sprite.posY <= anotherItem.sprite.posY - this.sprite.height
        )
      ) {
        return true;
      }
      return false;
    },

    speedUp: function () {
      this.speed = this.speed + 0.25;
    },

    lost: function (player) {
      var returnValue = false;
      if (
        player.originalPosition == "left" &&
        this.sprite.posX < player.sprite.posX - this.sprite.width
      ) {
        returnValue = true;
        this.speed = 2;
      } else if (
        player.originalPosition == "right" &&
        this.sprite.posX > player.sprite.posX + player.sprite.width
      ) {
        returnValue = true;
        this.speed = 1.75;
      }
      return returnValue;
    },
  },

  playerOne: {
    sprite: null,
    color: "#FFFFFF",
    goUp: false,
    goDown: false,
    originalPosition: "left",
    victory: false,
    score: 0,
    ai: false,
    name: "PLAYER ONE",
    isSelected: false,
    amI: false,
    engaging: true,
    ready: false,
  },

  playerTwo: {
    sprite: null,
    color: "#FFFFFF",
    goUp: false,
    goDown: false,
    originalPosition: "right",
    score: 0,
    victory: false,
    ai: true,
    name: "PLAYER TWO",
    isSelected: false,
    amI: false,
    engaging: true,
    ready: false,
  },

  init: function () {
    // Cibler et Redimensionner la div en rab - Non important
    this.blocRight = document.getElementById("right");
    this.blocRight.style.width = game.conf.BLOCRIGHTWIDTH + "px";
    this.blocRight.style.height = game.conf.BLOCRIGHTHEIGHT + "px";

    // Cibler et Redimensionner la div de menu/boutons - Non important
    this.blocLeft = document.getElementById("left");
    this.blocLeft.style.width = game.conf.BLOCLEFTWIDTH + "px";
    this.blocLeft.style.height = game.conf.BLOCLEFTHEIGHT + "px";

    // Cibler et Redimensionner la div du terrain de jeu - Non important
    this.divGame = document.getElementById("divGame");
    this.divGame.style.width = game.conf.BLOCDIVGAMEWIDTH + "px";
    this.divGame.style.height = game.conf.BLOCDIVGAMEHEIGHT + "px";

    // Cibler et Redimensionner les différents boutons - Non important
    this.startGameButton = document.getElementById("startGame");
    this.startGameButton.style.width = game.conf.BUTTONSTARTGAMEWIDTH + "px";
    this.pauseGameButton = document.getElementById("pauseGame");
    this.pauseGameButton.style.width = game.conf.BUTTONPAUSEGAMEWIDTH + "px";
    this.resumeGameButton = document.getElementById("resumeGame");
    this.resumeGameButton.style.width = game.conf.BUTTONRESUMEGAMEWIDTH + "px";

    // Les big bois du redimensionnement inutile demandé par le prof
    this.initScreenRes();
    this.resizeDisplayData(game.conf, this.ratioResX, this.ratioResY);

    // Cibler la div qui spam les différents états de la partie
    this.divInfo = document.getElementById("info");

    // Création et affichage du terrain de jeu
    this.groundLayer = game.display.createLayer(
      "terrain",
      game.conf.GROUNDLAYERWIDTH,
      game.conf.GROUNDLAYERHEIGHT,
      this.divGame,
      0,
      this.groundColor,
      10,
      50
    );
    game.display.drawRectangleInLayer(
      this.groundLayer,
      game.conf.NETWIDTH,
      game.conf.GROUNDLAYERHEIGHT,
      this.netColor,
      game.conf.GROUNDLAYERWIDTH / 2 - game.conf.NETWIDTH / 2,
      0
    );

    // Création et affichage des scores
    this.scoreLayer = game.display.createLayer(
      "score",
      game.conf.GROUNDLAYERWIDTH,
      game.conf.GROUNDLAYERHEIGHT,
      this.divGame,
      1,
      undefined,
      10,
      50
    );
    this.displayScore(0, 0);

    // Création et affichage de la balle (associer l'objet déclaré plus haut avec un sprite)
    this.playersBallLayer = game.display.createLayer(
      "joueursetballe",
      game.conf.GROUNDLAYERWIDTH,
      game.conf.GROUNDLAYERHEIGHT,
      this.divGame,
      2,
      undefined,
      10,
      50
    );
    this.ball.sprite = game.display.createSprite(
      game.conf.BALLWIDTH,
      game.conf.BALLHEIGHT,
      game.conf.BALLPOSX,
      game.conf.BALLPOSY,
      "./img/ball.png"
    );
    this.displayBall();

    // Création et affichage des jeux raquettes/players (associer les deux objets déclarés plus haut avec leur sprite)
    this.playerOne.sprite = game.display.createSprite(
      game.conf.PLAYERONEWIDTH,
      game.conf.PLAYERONEHEIGHT,
      game.conf.PLAYERONEPOSX,
      game.conf.PLAYERONEPOSY,
      "./img/playerOne.png"
    );
    this.playerTwo.sprite = game.display.createSprite(
      game.conf.PLAYERTWOWIDTH,
      game.conf.PLAYERTWOHEIGHT,
      game.conf.PLAYERTWOPOSX,
      game.conf.PLAYERTWOPOSY,
      "./img/playerTwo.png"
    );
    this.displayPlayers();

    // Initialiser les controles du jeu
    this.initKeyboard(game.control.onKeyDown, game.control.onKeyUp);

    // Déclarer les différents sons utilisés pendant la partie
    this.playerOneSound = new Audio("./sound/player_one.ogg");
    this.playerTwoSound = new Audio("./sound/player_two.ogg");
    this.victoryOneSound = new Audio("./sound/victory_2.ogg");
    this.victoryTwoSound = new Audio("./sound/victory_1.ogg");

    // Préciser à l'AI quelle raquette utilisée, et quelle balle
    if (!this.iaGame) this.checkIfBothPlayers();
    if (this.iaGame) {
      game.ai.setPlayerAndBall(this.playerTwo, this.ball);
      this.initStartGameButton();
      this.initStartGameButton();
      this.initPauseGameButton();
      this.initResumeGameButton();
    }
  },

  initStartGameButton: function () {
    // Bouton start = Action de la fonction associée dans game.control
    this.startGameButton.onclick = game.control.onStartGameClickButton;
  },

  initPauseGameButton: function () {
    // Bouton pause = Action de la fonction associée dans game.control
    this.pauseGameButton.onclick = game.control.onPauseGameClickButton;
  },

  initResumeGameButton: function () {
    // Bouton resume = Action de la fonction associée dans game.control
    this.resumeGameButton.onclick = game.control.onResumeGameClickButton;
  },

  updateInfoGame: function () {
    //Vérifie l'état de la partie et modifie le contenu de la div correspondante
    if (!this.gameOn && !this.ball.inGame) {
      if (this.playerOne.victory)
        this.divInfo.innerHTML =
          "[ <b>FIN DE PARTIE - victoire de " + this.playerOne.name + "</b> ]";
      if (this.playerTwo.victory)
        this.divInfo.innerHTML =
          "[ <b>FIN DE PARTIE - victoire de " + this.playerTwo.name + "</b> ]";
      else if (!this.playerTwo.victory && !this.playerOne.victory)
        this.divInfo.innerHTML = "[ <b>Laiolo Louis</b> - M1 MIAGE APP ]";
    }
    if (this.gameOn && !this.ball.inGame)
      this.divInfo.innerHTML = "[ <b>ESPACE</b> - Remise en jeu ]";
    if (this.gameOn && this.ball.inGame)
      this.divInfo.innerHTML = "[ <b>PONG HTML5</b> - En jeu ]";
    if (!this.gameOn && this.ball.inGame) {
      this.divInfo.innerHTML = "[ <b>PONG HTML5</b> - En pause ]";
    }
  },

  displayScore: function (scorePlayer1, scorePlayer2) {
    game.display.drawTextInLayer(
      this.scoreLayer,
      scorePlayer1,
      game.conf.SCOREFONTSIZE + "pt Courier New",
      "#AA9A8B",
      game.conf.SCOREPOSXPLAYER1,
      game.conf.SCOREPOSYPLAYER1
    );
    game.display.drawTextInLayer(
      this.scoreLayer,
      scorePlayer2,
      game.conf.SCOREFONTSIZE + "pt Courier New",
      "#AA9A8B",
      game.conf.SCOREPOSXPLAYER2,
      game.conf.SCOREPOSYPLAYER2
    );
    game.display.drawTextInLayer(
      this.scoreLayer,
      "VITESSE BALLE : " + this.ball.speed,
      "10px Courier New",
      "#AA9A8B",
      10,
      10
    );
  },

  displayBall: function () {
    game.display.drawImageInLayer(
      this.playersBallLayer,
      this.ball.sprite.img,
      this.ball.sprite.posX,
      this.ball.sprite.posY,
      game.conf.BALLWIDTH,
      game.conf.BALLHEIGHT
    );
  },

  displayPlayers: function () {
    game.display.drawImageInLayer(
      this.playersBallLayer,
      this.playerOne.sprite.img,
      this.playerOne.sprite.posX,
      this.playerOne.sprite.posY,
      game.conf.PLAYERONEWIDTH,
      game.conf.PLAYERONEHEIGHT
    );
    game.display.drawImageInLayer(
      this.playersBallLayer,
      this.playerTwo.sprite.img,
      this.playerTwo.sprite.posX,
      this.playerTwo.sprite.posY,
      game.conf.PLAYERTWOWIDTH,
      game.conf.PLAYERTWOHEIGHT
    );
  },

  moveBall: function () {
    //4) Encapsuler le mouvement, le rebond, et le refresh de l'affichage dans une seule fonction de l'objet game
    if (this.gameOn) {
      this.ball.move();
      this.ball.bounce();
    }
    this.displayBall();
  },

  speedUpBall: function () {
    game.ball.speedUp();
  },

  ballOnPlayer: function (player, ball) {
    var returnValue = "CENTER";
    var playerPositions = player.sprite.height / 5;
    if (
      ball.sprite.posY > player.sprite.posY &&
      ball.sprite.posY < player.sprite.posY + playerPositions
    ) {
      returnValue = "TOP";
    } else if (
      ball.sprite.posY >= player.sprite.posY + playerPositions &&
      ball.sprite.posY < player.sprite.posY + playerPositions * 2
    ) {
      returnValue = "MIDDLETOP";
    } else if (
      ball.sprite.posY >= player.sprite.posY + playerPositions * 2 &&
      ball.sprite.posY <
        player.sprite.posY + player.sprite.height - playerPositions
    ) {
      returnValue = "MIDDLEBOTTOM";
    } else if (
      ball.sprite.posY >=
        player.sprite.posY + player.sprite.height - playerPositions &&
      ball.sprite.posY < player.sprite.posY + player.sprite.height
    ) {
      returnValue = "BOTTOM";
    }
    return returnValue;
  },

  changeBallPath: function (player, ball) {
    if (player.originalPosition == "left") {
      switch (game.ballOnPlayer(player, ball)) {
        case "TOP":
          ball.directionX = 1;
          ball.directionY = -2;
          break;
        case "MIDDLETOP":
          ball.directionX = 1;
          ball.directionY = -1;
          break;
        case "CENTER":
          ball.directionX = 2;
          ball.directionY = 0.55;
          break;
        case "MIDDLEBOTTOM":
          ball.directionX = 1;
          ball.directionY = 1;
          break;
        case "BOTTOM":
          ball.directionX = 1;
          ball.directionY = 2;
          break;
      }
    } else {
      switch (game.ballOnPlayer(player, ball)) {
        case "TOP":
          ball.directionX = -1;
          ball.directionY = -2;
          break;
        case "MIDDLETOP":
          ball.directionX = -1;
          ball.directionY = -1;
          break;
        case "CENTER":
          ball.directionX = -2;
          ball.directionY = 0.55;
          break;
        case "MIDDLEBOTTOM":
          ball.directionX = -1;
          ball.directionY = 1;
          break;
        case "BOTTOM":
          ball.directionX = -1;
          ball.directionY = 2;
          break;
      }
    }
  },

  clearLayer: function (targetLayer) {
    //Pour jarter la trainée de la balle (voir game.display.js)
    targetLayer.clear();
  },

  initKeyboard: function (onKeyDownFunction, onKeyUpFunction) {
    window.onkeydown = onKeyDownFunction;
    window.onkeyup = onKeyUpFunction;
  },

  movePlayers: function () {
    if (game.control.controlSystem == "KEYBOARD") {
      // keyboard control
      if (game.playerOne.amI) {
        if (game.playerOne.goUp && game.playerOne.sprite.posY > 0) {
          game.playerOne.sprite.posY -= 5;
        } else if (game.playerOne.goDown && game.playerOne.sprite.posY < game.conf.GROUNDLAYERHEIGHT - game.playerOne.sprite.height) {
          game.playerOne.sprite.posY += 5;
        }
      } else if (game.playerTwo.amI) {
        if (game.playerTwo.goUp && game.playerTwo.sprite.posY > 0) {
          game.playerTwo.sprite.posY -= 5;
        } else if (
          game.playerTwo.goDown &&
          game.playerTwo.sprite.posY <
            game.conf.GROUNDLAYERHEIGHT - game.playerTwo.sprite.height
        ) {
          game.playerTwo.sprite.posY += 5;
        }
      }
    }
  },

  collideBallWithPlayersAndAction: function () {
    //Collisions entre raquette et balle = Son + Accélérer vitesse de la balle + 0.25
    if (this.ball.collide(game.playerOne)) {
      this.playerOneSound.play();
      this.changeBallPath(game.playerOne, game.ball);
      if (this.ball.speed <= this.maxGameSpeed)
        //La vitesse de la balle arrête d'augmenter au delà d'une certaine limite
        this.speedUpBall();
    }
    if (this.ball.collide(game.playerTwo)) {
      this.playerTwoSound.play();
      this.changeBallPath(game.playerTwo, game.ball);
      if (this.ball.speed <= this.maxGameSpeed) this.speedUpBall();
    }
  },

  lostBall: function () {
    if (this.ball.lost(this.playerOne)) {
      this.victoryOneSound.play();
      if (this.playerTwo.score != this.ultimateReward) {
        this.ball.inGame = false;
        this.playerTwo.score++;
        if (this.playerOne.ai) {
          setTimeout(function () {
            game.ai.startBall();
          }, 3000);
        }
      } else if (this.playerTwo.score >= this.ultimateReward) {
        this.victoryEndGame(this.playerTwo);
      }
    } else if (this.ball.lost(this.playerTwo)) {
      this.victoryTwoSound.play();
      if (this.playerOne.score != this.ultimateReward) {
        this.playerOne.score++;
        this.ball.inGame = false;
        if (this.playerTwo.ai) {
          setTimeout(function () {
            game.ai.startBall();
          }, 3000);
        }
      } else if (this.playerOne.score >= this.ultimateReward) {
        this.victoryEndGame(this.playerOne);
      }
    }
    this.scoreLayer.clear();
    this.displayScore(this.playerOne.score, this.playerTwo.score);
  },

  randomWallSound: function () {
    var numAudio = Math.floor(Math.random() * Math.floor(7));
    var nameAudio = "./sound/wall_hit_" + numAudio + ".ogg";
    var randomAudio = new Audio(nameAudio);
    randomAudio.play();
  },

  reinitGame: function () {
    this.ball.inGame = false;
    this.ball.speed = 2;
    this.playerOne.score = 0;
    this.playerTwo.score = 0;
    this.scoreLayer.clear();
    this.displayScore(this.playerOne.score, this.playerTwo.score);
  },

  initScreenRes: function () {
    this.targetResX = window.screen.availWidth;
    this.targetResY = window.screen.availHeight;
    this.ratioResX = this.targetResX / this.devResX;
    this.ratioResY = this.targetResY / this.devResY;
  },

  resizeDisplayData: function (object, ratioX, ratioY) {
    var property;
    for (property in object) {
      if (property.match(/^.*X.*$/i) || property.match(/^.*WIDTH.*$/i)) {
        object[property] = Math.round(object[property] * ratioX);
      } else {
        object[property] = Math.round(object[property] * ratioY);
      }
    }
  },

  victoryEndGame: function (player) {
    this.gameOn = false;
    this.ball.inGame = false;
    player.victory = true;
  },

  checkIfBothPlayers() {
    //Activer ou non le bouton start game si les deux joueurs sont là ou pas
    if (this.playerOne.isSelected && this.playerTwo.isSelected) {
      document.getElementById("startGame").disabled = false;
      this.initStartGameButton();
    } else document.getElementById("startGame").disabled = true;
  },
};
