var game_socket = require("./GameSocket");

function Game(max_players, id, socket_server) {
    this.max_players = max_players;
    this.id = id;
    
    var players = [];
    
    this.Player = function(id) {
        this.id = id; //Session id
        
        players.push(this);
    }
    
    //Configure socket
    game_socket(socket_server.of("/" + id), this);
}

Game.prototype = {
    isFull: function() {
        return this.players.length >= this.max_players;
    }
}

module.exports = Game;