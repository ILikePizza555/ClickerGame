var game_socket = require("./GameSocket");

//Factory function that returns a player class.
//I use this instead of outright inner class in Game to clean up the code a little
function factory_playerclass(game, config) {
    function Player(sid, name) {
        this.sid = sid; //Session id
        this.pid = game.players.length;
        this.name = name;
        
        //Game data
        this.clicker_data = {
            clicks_total: 0,
            clickrate: 0,
            last_click_time: 0
        };
        
        game.players.push(this);
    }
    
    Player.prototype = {
        update_clicker_data: function(delta_clicks) {
            var delta = (Date.now() - this.clicker_data.last_click_time);
            var clickrate = delta_clicks / delta * 1000;
            
            if(clickrate > config.max_clickrate) {
                this.clicker_data.clickrate = config.max_clickrate;
                this.clicker_data.clicks_total += config.max_clickrate * delta;
            } else {
                this.clicker_data.clicks_total += delta_clicks;
                this.clicker_data.clickrate = clickrate;
            }
            
            this.clicker_data.last_click_time = Date.now();
            
            game.clickrate += delta_clicks;
        }
    };
    
    return Player;
}

function Game(config, id, socket_server, session) {
    this.max_players = config.max_players;
    this.id = id;
    this.socket_server = socket_server;
    this.update_rate = config.update_rate;
    
    //Game data
    this.clicks = 0;
    this.clickrate = 0;
    
    this.Player = factory_playerclass(this, config);
    this.players = [];
    
    //Configure socket
    game_socket(socket_server, this, session);
    
    setInterval(this.update.bind(this), config.update_rate);
}

Game.prototype = {
    isFull: function() {
        return this.players.length >= this.max_players;
    },
    update_clicker_data: function() {
        this.clickrate = 0;
        
        for(var i = 0; i < this.players.length; i++) {
            this.clickrate += this.players[i].clicker_data.clickrate;
        }
        
        this.clicks += this.clickrate * this.update_rate / 1000;
    },
    update: function() {
        this.update_clicker_data();
        
        this.socket_server.emit("click update", {clicks: this.clicks, clickrate: this.clickrate});
    },
    getPlayerByPID: function(pid) {
        return this.players[pid];
    },
    getPlayerBySID: function(sid) {
        var len = this.players.length;
        
        for (var i = 0; i < len; i++) {
            if(this.players[i].sid === sid) {return this.players[i];}
        }
        return null;
    }
};

module.exports = Game;