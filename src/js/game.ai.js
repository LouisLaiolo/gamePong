game.ai = {

	player : null,
	ball : null,
	playerSpeed : null,

	setPlayerAndBall : function(player, ball) {
    	this.player = player;
    	this.ball = ball;
  	},

  	move : function() {
    	if ( this.ball.directionX > 0 ) {
      		if ( this.player.originalPosition == "right" )
        		this.followBall();
      		if ( this.player.originalPosition == "left" )
        		this.goCenter();
    	} else {
      		if ( this.player.originalPosition == "right" ) 
        		this.goCenter();
      		if ( this.player.originalPosition == "left" ) 
        		this.followBall();
    	}
  	},

  	followBall : function() {
  		this.playerSpeed = this.ball.speed;
	    if ( this.ball.sprite.posY < this.player.sprite.posY + this.player.sprite.height/2 ) { // pos de la balle est au dessus de celle de la raquette
	     	this.player.sprite.posY = this.player.sprite.posY - this.playerSpeed;
	    } else if ( this.ball.sprite.posY > this.player.sprite.posY + this.player.sprite.height/2 ) { // pos de la balle est en dessous de celle de la raquette
	      	this.player.sprite.posY = this.player.sprite.posY + this.playerSpeed;
	    }
	},
 
  	goCenter : function() {
  		this.playerSpeed = this.ball.speed;
    	if ( this.player.sprite.posY + this.player.sprite.height/2 > game.conf.GROUNDLAYERHEIGHT / 2 ) {
      		this.player.sprite.posY = this.player.sprite.posY - this.playerSpeed;
    	} else if ( this.player.sprite.posY + this.player.sprite.height/2 < game.conf.GROUNDLAYERHEIGHT / 2 ) {
      		this.player.sprite.posY = this.player.sprite.posY + this.playerSpeed;
    	}
  	},

  	startBall : function() {
	    if ( this.player.originalPosition == "right" ) {
	      this.ball.inGame = true;
	      this.ball.sprite.posX = this.player.sprite.posX;
	      this.ball.sprite.posY = this.player.sprite.posY;
	    } else {
	      this.ball.inGame = true;
	      this.ball.sprite.posX = this.player.sprite.posX + this.player.sprite.width;
	      this.ball.sprite.posY = this.player.sprite.posY;
	    }
  }
};