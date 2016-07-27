const express = require("express");

function configApp(app, config, session) {
    app.set("view engine", "pug");
    app.set("views", config.view_dir);
    
    app.use(session);
    app.use("/static", express.static(config.static_dir));
    
    return app;
}

function configWebRoutes(app) {
    app.get("/", function route_index(req, res) {
        res.render("index");
    });
}

function configApiRoutes(app, game_manager) {
    
}

module.exports = function buildApp(config, app, session, game_manager) {
    configApp(app, config, session);
    configWebRoutes(app);
    configApiRoutes(app, game_manager);
}