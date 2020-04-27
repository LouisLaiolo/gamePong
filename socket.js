var players = {};
var rooms = {
}
var gameRoomTwo = "versus";
var gameRoomFour = "confused";

module.exports = function (io) {

  function findAvailableRooms(client){
    return Object.keys(rooms).filter(r=>{
      return r.player2 ==null && r.player1 != players[client.id]
    })
  }

  io.on("connection", (client) => {
    io.emit("list_joueurs", players);

    client.on("login_register", (data) => {
      var username = data.username;
      players[client.id] = {
        id : client.id,
        username: username,
        posY:0
      };
      client.emit("logged_in");

      io.emit("list_joueurs", players);
    });

    client.on("playTwo", () => {
      var rms = findAvailableRooms(client)
      if(rms.length>0){
        rm = rooms[rms[0]]
        rm.player2 = players[client.id]

        io.to(rm.player1.id).emit('matchIsFound',rm);
        io.to(rm.player2.id).emit('matchIsFound',rm);
      }else {
        rmName = 'play-two-'+rms.length
        rooms[rmName] = {
          name : rmName,
          player1 : players[client.id],
          player2 : null,
          balle : {
            x:0,
            y:0
          },
          score : {
            player1: 0,
            player2:0
          }
        }
      }

    });
    client.on("disconnect", () => {
      delete players[client.id];
      client.emit("list_joueurs", players);
      for (let index = 0; index < Object.keys(rooms).length; index++) {
        var room = rooms[Object.keys(rooms)[index]];
      
        if(room.player1.id == client.id){
          if(room.player2)
            io.to(room.player2.id).emit('gameEnd')
          delete rooms[room.name]
          break;
        }else if(room.player2){
          if(room.player2.id == client.id){
            io.to(room.player1.id).emit('gameEnd')
            delete rooms[room.name]
            break;

            }

        }
      }
    });
    client.on("playerMove", (posY) => {
      let foundRoom = Object.keys(rooms).find(r=>{
        if(rooms[r].player1.id == client.id)
          return true;
        else if (rooms[r].player2)
          return rooms[r].player2.id == client.id
      })
      if(rooms[foundRoom]){
        let p = client.id == rooms[foundRoom].player1.id ?'player1':'player2'
        if(rooms[foundRoom][p].posY != posY){
          rooms[foundRoom][p].posY = posY;
          if(p=='player1')
            io.to(rooms[foundRoom].player2.id).emit('playerOnemove',rooms[foundRoom].player1)
            else
          io.to(rooms[foundRoom].player1.id).emit('playerTwomove',rooms[foundRoom].player2)
        }
      }
      
    });

    client.on("ball", (data) => {

      let foundRoom = Object.keys(rooms).find(r=>{
        return rooms[r].player1.id == client.id
      })
      if(rooms[foundRoom]){
        rooms[foundRoom].balle=data;
        io.to(rooms[foundRoom].player2.id).emit('ballmove',rooms[foundRoom].balle)
      }
    });


  });
};
