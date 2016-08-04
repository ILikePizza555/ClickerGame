/**
 * Class that manages games. Does 2 tasks:
 * 1. Provides an interface for the web api.
 * 2. Properly initializes new sockets.
 */
const Game = require("./Game");
const GameSocket = require("./GameSocket");

var games = [];

function GameManager(config, socket_server, session) {
    
    this.join_game = function(player_sid, player_name) {
        if(games.length === 0 || games.last().isFull()) {
            //Game is full, make a new one
            var new_game = new Game(config, games.length, socket_server.of("/" + games.length), session);
            //Add our player to it
            new new_game.Player(player_sid, player_name);
            //Add it to storage
            games.push(new_game);
            
            return new_game.id;
        } else {
            //Not full
            var game = games.last();
            new game.Player(player_sid, player_name);
            return game.id;
        }
    };
}

GameManager.prototype = {
    getGameById: function(id) {
        return games[id];
    },
    exists: function(game_id) {
        return !!games[game_id];
    },
    validate: function(game_id, sid) {
        if(!games[game_id]) { return false; }
        return !!games[game_id].getPlayerBySID(sid);
    }
};

module.exports = GameManager;