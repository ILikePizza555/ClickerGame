module.exports = function configSocket(socket_server, game) {
    socket_server.on("connection", function(socket) {
        console.log("Connection!");
    });
}