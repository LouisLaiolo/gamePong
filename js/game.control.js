game.control = {
   
  controlSystem : null, //Le jeu ne se joue qu'au clavier, mais au cas ou on veuille y foutre autre chose un de ces quatres...

  onKeyDown : function(event) {
  	game.control.controlSystem = "KEYBOARD";
    if ( event.keyCode == game.keycode.KEYDOWN ) {
		game.playerOne.goDown = true;
    } else if ( event.keyCode == game.keycode.KEYUP ) {
		game.playerOne.goUp = true;
    }
    if (event.keyCode == game.keycode.SPACEBAR && !game.ball.inGame && game.gameOn ) { 
		game.ball.inGame = true;
		game.ball.sprite.posX = game.playerOne.sprite.posX + game.playerOne.sprite.width;
		game.ball.sprite.posY = game.playerOne.sprite.posY;
    }
  },
  onKeyUp : function(event) {
    if ( event.keyCode == game.keycode.KEYDOWN ) {
      game.playerOne.goDown = false;
    } else if ( event.keyCode == game.keycode.KEYUP ) {
      game.playerOne.goUp = false;
    }
  },
  onStartGameClickButton : function() {
    if ( !game.gameOn ) {
      game.gameOn = true;
      game.reinitGame();
    }
  },
  onPauseGameClickButton : function() { //Cliquer sur pause => Faire disparaitre bouton Pause et afficher bouton Resume
    if ( game.gameOn ) {
      game.gameOn = false;
      game.pauseGameButton.style.display = 'none';
      game.resumeGameButton.style.display = 'inline';
    }
  },
  onResumeGameClickButton : function() { //Cliquer sur resume => Faire disparaitre bouton Resume et afficher bouton Pause
    if ( !game.gameOn ) {
      game.gameOn = true;
      game.pauseGameButton.style.display = 'inline';
      game.resumeGameButton.style.display = 'none';
    }
  }
};