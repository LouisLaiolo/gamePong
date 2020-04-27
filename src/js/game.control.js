game.control = {
  controlSystem: null, //Le jeu ne se joue qu'au clavier, mais au cas ou on veuille y foutre autre chose un de ces quatres...

  /* MAIN MENU ACTIONS */

  onKeyDown: function (event) {
    game.control.controlSystem = "KEYBOARD";
    if (event.keyCode == game.keycode.KEYDOWN) {
     if (game.playerOne.amI) {
        game.playerOne.goDown = true;
        game.playerOne.goUp = false;
      } else if (game.playerTwo.amI) {
        game.playerTwo.goDown = true;
        game.playerTwo.goUp = false;
      }
    } else if (event.keyCode == game.keycode.KEYUP) {
      if (game.playerOne.amI) {
        game.playerOne.goDown = false;
        game.playerOne.goUp = true;
      } else if (game.playerTwo.amI) {
        game.playerTwo.goDown = false;
        game.playerTwo.goUp = true;
      }
    }
    if (event.keyCode == game.keycode.SPACEBAR && !game.ball.inGame && game.gameOn) {
      game.ball.inGame = true;
      if (game.playerOne.amI) {
        game.ball.sprite.posX = game.playerOne.sprite.posX + game.playerOne.sprite.width;
        game.ball.sprite.posY = game.playerOne.sprite.posY;
      } else if (game.playerTwo.amI) {
        game.ball.sprite.posX = game.playerTwo.sprite.posX + game.playerTwo.sprite.width;
        game.ball.sprite.posY = game.playerTwo.sprite.posY;
      }
    }
  },

  onKeyUp: function (event) {
    if (event.keyCode == game.keycode.KEYDOWN) {
      if (game.playerOne.amI) 
        game.playerOne.goDown = false;
      else if (game.playerTwo.amI) 
        game.playerTwo.goDown = false;
    } else if (event.keyCode == game.keycode.KEYUP) {
      if (game.playerOne.amI) 
        game.playerOne.goUp = false;
      else if (game.playerTwo.amI) 
        game.playerTwo.goUp = false;
    }
  },

  onStartGameClickButton: function () {
    if (!game.gameOn) {
      game.gameOn = true;
      game.reinitGame();
    }
  },

  onPauseGameClickButton: function () {
    //Cliquer sur pause => Faire disparaitre bouton Pause et afficher bouton Resume
    if (game.gameOn) {
      game.gameOn = false;
      game.pauseGameButton.style.display = "none";
      game.resumeGameButton.style.display = "inline";
    }
  },

  onResumeGameClickButton: function () {
    //Cliquer sur resume => Faire disparaitre bouton Resume et afficher bouton Pause
    if (!game.gameOn) {
      game.gameOn = true;
      game.pauseGameButton.style.display = "inline";
      game.resumeGameButton.style.display = "none";
    }
  },
};
