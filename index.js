var config = {
    server: {
        ip: process.env.IP,
        port: process.env.PORT
    },
    web: {
        view_dir: "./web/public",
        static_dir: "./web/static"
    },
    session: {
        secret: "keyboard cat",
        resave: true,
        saveUninitialized: true,
        cookie: {
            maxAge: 6000000,
            httpOnly: false
        }
    },
    redis_store: {
        host: process.env.IP,
        port: 6379
    },
    game: {
        max_players: 1000,
        max_delta_clicks: 30,
        click_update_rate: 3000,
        full_update_rate: 5000,
    }
};

/* IMPORTS */
require("./utils");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const express_session = require("express-session");
const RedisStore = require("connect-redis")(express_session);

const web = require("./web/web");
const GameManager = require("./game/GameManager");

/* Server initialization */
var express_app = express(); //Add routes later
var http_server = http.Server(express_app);
var socket_server = socketio(http_server);

var session_store = new RedisStore(config.redis_store);
config.session.store = session_store;
//Initialize the session middleware here, since both express and socket.io need them
var session = express_session(config.session);

//Finally start configuring the app itself
var game_manager = new GameManager(config.game, socket_server, session);
web(config.web, express_app, session, game_manager);

http_server.listen(config.server.port, config.server.ip, 511, function() {
    console.log("Listening on " + config.server.port);
});