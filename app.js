const NodeServer = require('@voliware/node-server');
const ChatServer = require('./chat/chatServer');
const Path = require('path');

class App {
    constructor(){
        let self = this;

        this.httpServer = new NodeServer.HttpServer({
            publicPath: Path.join(__dirname, "public")
        });
        this.chatServer = new ChatServer({port: 5001});

        this.httpServer.addRoute("GET", "/rooms", function(request, response){
            response.json(self.chatServer.roomManager.serialize())
        });

        this.httpServer.start();
        this.chatServer.start();
        return this;
    }
}

let app = new App();