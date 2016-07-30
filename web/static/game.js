/* global io */
/* global $ */

/* Utilities */
Array.prototype.last = function() {
    return this[this.length - 1];
};

Math.roundTo = function(number, digits) {
    return parseFloat(number.toFixed(digits));
};

var config = {
    server_update_rate: 3000,
    client_update_rate: 16
};

/* Classes */
function ClickComponent(game) {
    this.ref_game = game;
    
    //Data
    this.clicks = 0;
    
    this.local_click_rate = 0;
    this.last_click_time = 0;
    
    this.global_click_rate = 0;
    
    //UI
    this.button_clicker = $("#btn-click");
    this.label_clicks = $("#label-click-counter");
    
    this.button_clicker.click(this.button_click_handler.bind(this));
}

ClickComponent.prototype = {
    button_click_handler: function() {
        this.clicks += 1;
        
        var now = Date.now();
        this.local_click_rate = 1 / (now - this.last_click_time);
        this.last_click_time = now;
    },
    
    update_server: function() {
        
    },
    
    update_client: function() {
        
    },
    
    update_ui: function() {
        
    }
};

function Game() {
    this.id = window.location.pathname.split("/").last();
    this.socket = io("/" + this.id);
    
    var components = {};
    
    for (var i = 0; i < arguments.length; i = i + 1) {
        var Component = arguments[i];
        components[Component.name] = new Component(this);
    }
}

$(document).ready(function entry() {
    var game = new Game(ClickComponent);
});