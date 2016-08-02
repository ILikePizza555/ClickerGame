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
    this.local_clicks = 0;
    
    //UI
    this.label_counter = $("#label-click-counter");
    this.btn_clicker = $("#btn-click");
    
    //Set the callbacks
    this.btn_clicker.click(this.btn_clicker_handler.bind(this));
    
    game.client_update_callbacks.push(this.update_client.bind(this));
    game.ui_update_callbacks.push(this.update_ui.bind(this));
}

Clicker.prototype = {
    btn_clicker_handler: function(e) {
        this.local_clicks += 1;
    },
    update_client: function() {
        
    },
    update_ui: function() {
        this.label_counter.text(this.local_clicks);
    }
};

$(document).ready(function entry() {
    var clicker = new Clicker();
    
    game.start();
});