/* global io */
/* global $ */

"use strict";

/* Utilities */
Array.prototype.last = function() {
	return this[this.length - 1];
};

Math.roundTo = function(number, digits) {
	return parseFloat(number.toFixed(digits));
};

function invoke_callback(func, i, a) {
	func();
}

// Variables
var config = {
	server_update_rate: 3000,
	client_update_rate: 16
};

var id = window.location.pathname.split("/").last();
var socket = io("/" + id);

var game = {
	server_update_callbacks: [],
	client_update_callbacks: [],
	ui_update_callbacks: [],
	sync_handlers: [],
	
	update_server: function() {
		this.server_update_callbacks.forEach(invoke_callback);
	},
	update_client: function() {
		this.client_update_callbacks.forEach(invoke_callback);
		window.requestAnimationFrame(this.ui_update_callbacks.forEach.bind(this.ui_update_callbacks, invoke_callback));
	},
	start: function() {
		this.s_update_interval = setInterval(this.update_server.bind(this), config.server_update_rate);
		this.c_update_interval = setInterval(this.update_client.bind(this), config.client_update_rate);
	}
};

//Clicker class, in charge of handling the clicker, updating the server, and displaying clicks
function Clicker() {
	//Data
	this.clicks = 0; //Total clicks, including those by the global clickrate
	this.click_delta = 0; //Number of clicks since last update
	
	this.local_clickrate = 0;
	this.global_clickrate = 0;
	
	//UI
	this.label_counter = $("#label-click-counter");
	this.btn_clicker = $("#btn-click");
	this.label_cps = $("#label-cps");
	
	//Set the callbacks
	this.btn_clicker.click(this.btn_clicker_handler.bind(this));
	
	game.client_update_callbacks.push(this.update_client.bind(this));
	game.server_update_callbacks.push(this.update_server.bind(this));
	game.ui_update_callbacks.push(this.update_ui.bind(this));
	
	socket.on("sync click", this.sync_handler.bind(this));
	socket.on("sync full", this.sync_handler.bind(this));
}

Clicker.prototype = {
	btn_clicker_handler: function(e) {
		this.clicks += 1;
		this.click_delta += 1;
	},
	sync_handler: function(d) {
		console.log("s: " + d.clicks + " c: " + this.clicks + " d: " + (d.clicks - this.clicks));
		console.log("sr: " + d.clickrate + " cr: " + this.local_clickrate + " dr: " + (d.clickrate - this.local_clickrate));
		
		this.clicks = d.clicks;
		this.global_clickrate = d.clickrate;
	},
	update_client: function() {
		//Client-side interpolation for clicks
		//Doesn't really handle changes in click rates very well, but most people playing clickers usually click at max rate.
		this.clicks += (this.global_clickrate - this.local_clickrate) * (config.client_update_rate / 1000);
	},
	update_server: function() {
		socket.emit("click update", this.click_delta);
		this.local_clickrate = this.click_delta / (config.server_update_rate / 1000);
		this.click_delta = 0;
	},
	update_ui: function() {
		this.label_counter.text(Math.round(this.clicks));
		this.label_cps.text(Math.roundTo(this.global_clickrate, 2));
	}
};

function Player(pid, name, clicks) {
	this.pid = pid;
	this.name = name;
	this.clicks = clicks;
}

function PlayerList() {
	this.players = [];
	this.player_list_changed = false;
	
	//UI
	this.label_player_count = $("#label-player-count");
	this.list_players = $("#list-players");
	
	//Callbacks
	game.ui_update_callbacks.push(this.update_ui.bind(this));
	
	socket.on("player join", this.player_join_handler.bind(this));
	socket.on("player disconnect", this.player_disconnect_handler.bind(this));
	socket.on("sync full", this.full_sync_handler.bind(this));
}

PlayerList.prototype = {
	full_sync_handler: function(data) {
		for(var i = 0; i < data.players.length; i++) {
			var player_data = data.players[i];
			this.players[player_data.pid] = new Player(player_data.pid, player_data.name, player_data.clicks);
			this.player_list_changed = true;
		}
	},
	player_join_handler: function(player) {
		this.players[player.pid] = new Player(player.pid, player.name, player.clicks);
		this.player_list_changed = true;
	},
	player_disconnect_handler: function(pid) {
		delete this.players[pid];
		this.player_list_changed = true;
	},
	update_ui: function() {
		this.label_player_count.text(this.players.length);
		
		if(this.player_list_changed) {
			this.list_players.empty();
			
			for (var pid in this.players) {
				if(!this.players.hasOwnProperty(pid)) { continue; }
				
				var player = this.players[pid];
				var html = $("<span>").addClass("name").css("color", player.pid).text(player.name)
				.after(" - ")
				.after($("<span>").addClass("clicks").text(player.clicks));
				
				this.list_players.append($("<li>").append(html));
			}
		}
		
		this.player_list_changed = false;
	}
};

var clicker = null;
var player_list = null;

$(document).ready(function entry() {
	clicker = new Clicker();
	player_list = new PlayerList();
	
	socket.emit("req sync full");
	socket.once("sync full", function game_starter() {
		game.start();
	});
});