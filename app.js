const ChatServer = require('./chat/chatServer');

class App {
    constructor(){
        this.server = new ChatServer({
            port: 555
        });
        this.server.start();
        return this;
    }
}

let app = new App();