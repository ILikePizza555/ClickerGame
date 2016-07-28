const express = require("express");
const body_parser = require("body-parser");

function configApp(app, config, session) {
    app.set("view engine", "pug");
    app.set("views", config.view_dir);
    
    app.use(session);
    app.use(body_parser.json());
    app.use(body_parser.urlencoded({extended: false}));
    app.use("/static", express.static(config.static_dir));
    
    return app;
}

function configWebRoutes(app) {
    app.get("/", function route_index(req, res) {
        res.render("index", {title: "Click Buddies"});
    });
    
    app.get("/game/:id", function route_game(req, res) {
        res.render("game", {title: "Click Buddies"});
    });
}

function configApiRoutes(app, game_manager) {
    app.post("/join_game", function route_join_game(req, res) {
        //Check username
        if(!req.body.username) { 
            res.status(400).send("Invalid username.");
            return;
        }
        
        //Check if already in a game
        if(req.session.user && req.session.user.game_id) {
            res.redirect(302, "/game/" + req.session.user.game_id);
        }
        
        console.log("New user: " + req.body.username);
        
        var game_id = game_manager.join_game(req.sessionID);
        
        //Create a user object in the session
        req.session.user = {
            name: req.body.username,
            game_id: game_id
        }
        
        res.redirect(302, "/game/" + game_id);
    });
}

module.exports = function buildApp(config, app, session, game_manager) {
    configApp(app, config, session);
    configWebRoutes(app);
    configApiRoutes(app, game_manager);
}