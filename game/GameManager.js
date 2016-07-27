/**
 * Class that manages games. Does 2 tasks:
 * 1. Provides an interface for the web api.
 * 2. Properly initializes new sockets.
 */
const Game = require("./Game");

var games = [];

function GameManager(config, socket_server, session_store) {
    
}

GameManager.prototype = {
    joinGame: function(player_id) {
        
    }
}

module.exports = GameManager;