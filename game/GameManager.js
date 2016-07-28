/**
 * Class that manages games. Does 2 tasks:
 * 1. Provides an interface for the web api.
 * 2. Properly initializes new sockets.
 */
const Game = require("./Game");

var games = [];

function GameManager(config, socket_server, session_store) {
    
    this.join_game = function(player_id) {
        if(games.length === 0 || games.last().isFull()) {
            //Game is full, make a new one
            var new_game = new Game(config.max_players_game, games.length, socket_server);
            //Add our player to it
            new new_game.Player(player_id);
            //Add it to storage
            games.push(new_game);
            
            return new_game.id;
        } else {
            //Not full
            var game = game.last();
            new game.Player(player_id);
            return game.id;
        }
    }
}

GameManager.prototype = {
    getGameById: function(id) {
        return games[id];
    },
    exists: function(game_id) {
        return !!games[game_id];
    }
}

module.exports = GameManager;