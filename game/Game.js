const game_socket = require("./GameSocket");
const randomstring = require("randomstring");

function Player(sid, name, pid, config, game) {
    this.sid = sid; //Session id
    this.name = name;
    this.pid = pid;
    this.config = config;
    this.game = game;

    //Game data
    this.clicker_data = {
        clicks_total: 0,
        clickrate: 0,
        last_click_time: 0
    };
}

Player.prototype = {
    update_clicker_data: function(delta_clicks) {
        var delta = (Date.now() - this.clicker_data.last_click_time);
        var clickrate = delta_clicks / delta * 1000;

        if (clickrate > this.config.max_clickrate) {
            this.clicker_data.clickrate = this.config.max_clickrate;
            this.clicker_data.clicks_total += this.config.max_clickrate * delta;
        }
        else {
            this.clicker_data.clicks_total += delta_clicks;
            this.clicker_data.clickrate = clickrate;
        }

        this.clicker_data.last_click_time = Date.now();

        this.game.clickrate += delta_clicks;
    },
    generate_sync_data: function() {
        return {
            pid: this.pid,
            name: this.name,
            clicks: this.clicker_data.clicks_total
        };
    },
    disconnect: function() {
        delete this.game.players[this.pid];
    }
};


function Game(config, id, socket_server, session) {
    this.max_players = config.max_players;
    this.id = id;
    this.socket_server = socket_server;
    this.update_rate = config.update_rate;
    
    //Game data
    this.clicks = 0;
    this.clickrate = 0;
    
    this.players = {};
    
    //Configure socket
    game_socket(socket_server, this, session);
    
    setInterval(this.update.bind(this), config.update_rate);
}

Game.prototype = {
    isFull: function() {
        return Object.keys(this.players).length >= this.max_players;
    },
    create_player: function(sid, name, config) {
        var pid = randomstring.generate({length: 6, charset: "hex", capitalization: "lowercase"});
        this.players[pid] = new Player(sid, name, pid, config, this);
    },
    update_clicker_data: function() {
        this.clickrate = 0;
        
        for(var pid in this.players) {
            if(!this.players.hasOwnProperty(pid)) { continue; }
            
            this.clickrate += this.players[pid].clicker_data.clickrate;
        }
        
        this.clicks += this.clickrate * this.update_rate / 1000;
    },
    update: function() {
        this.update_clicker_data();
        
        this.socket_server.emit("sync click", {clicks: this.clicks, clickrate: this.clickrate});
    },
    getPlayerByPID: function(pid) {
        return this.players[pid];
    },
    getPlayerBySID: function(sid) {
        for (var pid in this.players) {
            if(!this.players.hasOwnProperty(pid)) { continue; }
            
            if(this.players[pid].sid === sid) { return this.players[pid]; }
        }
        
        return undefined;
    },
    generate_sync_data: function() {
        //Build the player data
        var player_data = [];
        
        for (var pid in this.players) {
            if(!this.players.hasOwnProperty(pid)) { continue; }
            
            player_data.push(this.players[pid].generate_sync_data());
        }
        
        return {
            player_count:Object.keys(this.players).length,
            players: player_data,
            clicks: this.clicks,
            clickrate: this.clickrate
        };
    }
};

module.exports = Game;