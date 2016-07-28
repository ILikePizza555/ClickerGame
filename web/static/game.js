/* global io */

//Utilities
Array.prototype.last = function() {
    return this[this.length - 1];
}

var game_id = window.location.pathname.split("/").last();
var socket = io("/" + game_id);