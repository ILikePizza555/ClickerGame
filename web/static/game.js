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
    
    socket.on("click update", this.click_update_handler.bind(this));
}

Clicker.prototype = {
    btn_clicker_handler: function(e) {
        this.clicks += 1;
        this.click_delta += 1;
    },
    click_update_handler: function(d) {
        console.log("s: " + d.clicks + " c: " + this.clicks + " d: " + (d.clicks - this.clicks));
        console.log("sr: " + d.clickrate + " cr: " + this.local_clickrate + " dr: " + (d.clickrate - this.local_clickrate));
        
        this.clicks = d.clicks;
        this.global_clickrate = d.clickrate;
    },
    update_client: function() {
        this.clicks += (this.global_clickrate * (config.client_update_rate / 1000)) - (this.local_clickrate * (config.client_update_rate / 1000));
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

$(document).ready(function entry() {
    var clicker = new Clicker();
    
    game.start();
});