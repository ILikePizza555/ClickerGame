/**
 * This module returns a function that sets up the socket server for the provided game.
 */
module.exports = function configSocket(socket_server, game, session) {
    socket_server.use(function middleware_session(socket, next) {
        session(socket.handshake, {}, next);
    });
    
    socket_server.use(function middleware_game_auth(socket, next) {
        var player = game.getPlayerBySID(socket.handshake.sessionID);
        
        if(!player) { 
            next(new Error("Player " + socket.handshake.sessionID + " is not in the game!"));
            return;
        }
        
        player.name = socket.handshake.session.user.name;
        socket.player = player;
        next();
    });
    
    socket_server.on("connection", function(socket) {
        socket.on("click update", function click_update_handler(click_delta) {
            if(typeof click_delta !== "number") {
                return;
            }
            
            socket.player.update_clicker_data(click_delta);
        });
    });
};