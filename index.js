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
        secret: "keyboard cat"
    },
    redis_store: {
        host: process.env.IP,
        port: 6379
    }
};

/* IMPORTS */
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const express_session = require("express-session")
const RedisStore = require("connect-redis")(express_session);

const web = require("./web/web");
const GameManager = require("./game/GameManager");

/* Server initialization */
var express_app = express(); //Add routes later
var http_server = http.Server(express_app);
var socket_server = socketio(http_server);

//Initalize the session and session store here, and pass to the modules, since both express and socket.io need them.
var session_store = new RedisStore(config.redis_store);
config.session.store = session_store;
var session = express_session(config.session);

//Finally start configuring the app itself
var game_manager = new GameManager(config, socketio, session_store);
web(express_app, session);

http.listen(config.server.ip, config.server.port);