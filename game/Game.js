var game_socket = require("./GameSocket");

function Game(max_players, id, socket_server, session) {
    this.max_players = max_players;
    this.id = id;
    
    //Game data
    this.clicks = 0;
    
    var players = [];
    
    this.Player = function(sid, name) {
        this.sid = sid; //Session id
        this.pid = players.length;
        this.name = name;
        
        players.push(this);
    };
    
    //Configure socket
    game_socket(socket_server.of("/" + id), this, session);
    
    /* Priveleged Functions */
    this.getPlayerByPID = function(pid) {
        return players[pid];
    };
    
    this.getPlayerBySID = function(sid) {
        var len = players.length;
        
        for (var i = 0; i < len; i++) {
            if(players[i].sid === sid) {return players[i];}
        }
        return null;
    };
}

Game.prototype = {
    isFull: function() {
        return this.players.length >= this.max_players;
    }
};

module.exports = Game;