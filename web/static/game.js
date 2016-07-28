/* global io */

var game_id = window.location.pathname.split("/")[1];
var socket = io("/" + game_id);