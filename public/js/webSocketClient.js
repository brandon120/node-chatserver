/**
 * Web socket client
 * @extends {EventSystem}
 */
class WebSocketClient extends EventSystem {

    /**
     * Constructor
     * @param {object} options 
     * @return {WebSocketClient}
     */
    constructor(options) {
        super();
        let defaults = {
            ip: 'wss://localhost',
            port: 443,
            autoReconnect: true,
            maxReconnectAttempts: 0,
            reconnectIntervalTimer: 5000,
            id: null
        };
        for (let k in defaults) {
            if (options.hasOwnProperty(k) && typeof options[k] !== "undefined") {
                defaults[k] = options[k];
            }
        }
        this.ip = defaults.ip;
        this.port = defaults.port;
        this.id = defaults.id;
        this.ws = null;
        this.lastPingSent = 0;
        this.latency = 0;
        this.reconnectInterval = null;
        this.reconnectAttempts = 0;
        this.reconnectIntervalTimer = defaults.reconnectIntervalTimer;
        this.maxReconnectAttempts = defaults.maxReconnectAttempts;
        this.autoReconnect = defaults.autoReconnect;
        return this;
    }
    
    /**
     * Set the id 
     * @param {string} id
     * @return {WebSocketClient}
     */
    setId(id){
        this.id = id;
        return this;
    }

    /**
     * Connect the websocket to the server.
     * The only way to connect/reconnect is to recreate the socket.
     * @return {WebSocketClient}
     */
    connect(){
        let url = this.ip + ":" + this.port;
        if(this.id !== null){
            url += "/?id=" + this.id;
        }
        this.close();
        this.ws = new WebSocket(url);
        this.attachWebSocketHandlers();
        return this;
    }
    
    /**
     * Close the WebSocket and set it to null
     * @return {WebSocketClient}
     */
    close(){
        if(this.ws){
            this.ws.close();
        }
        this.ws = null;
        return this;
    }

    /**
     * Attach handlers to the websocket
     * @return {WebSocketClient}
     */
    attachWebSocketHandlers() {
        let self = this;
        this.ws.addEventListener('open', function(e){
            console.log(e);
            self.stopAutoReconnect();
            self.emit('open', e);
        });
        this.ws.addEventListener('message', function(data){
            console.log(data);
            if(data.data === "ping"){
                self.send("pong");
            }
            else if(data.data === "pong"){
                self.recordLatency();
            }
            else {
                let json = {};
                try{
                    json = JSON.parse(data.data);
                    self.emit('message', json);   
                }
                catch(e){
                    console.error(e);
                }
            }
        });
        this.ws.addEventListener('error', function(error){
            console.log(error);
            self.emit('error', error);
            if(self.autoReconnect && self.reconnectInterval === null){
                self.startAutoReconnect();
            }  
        });
        this.ws.addEventListener('close', function(e){
            console.log(e);
            self.emit('close', e);
            if(!e.wasClean && self.autoReconnect && self.reconnectInterval === null){
                self.startAutoReconnect();
            }
        });
        return this;
    }

    /**
     * Send a message through the socket
     * @param {*} msg
     * @return {WebSocketClient}
     */
    send(msg) {
        this.ws.send(msg);
        return this;
    }

    /**
     * Send a JSON message through the socket
     * @param {object} json
     * @return {WebSocketClient}
     */
    sendJson(json) {
        return this.send(JSON.stringify(json));
    }

    /**
     * Start trying to reconnect to the server on an interval
     * @return {WebSocketClient}
     */
    startAutoReconnect() {
        let self = this;
        this.reconnectAttempts = 0;
        this.reconnectInterval = setInterval(function(){
            self.reconnect();
        }, this.reconnectIntervalTimer);
        return this;
    }

    /**
     * Stop trying to reconnect to the server 
     * @return {WebSocketClient}
     */
    stopAutoReconnect() {
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
        return this;
    }

    /**
     * Try to reconnect to the server.
     * Will bail if max attempts has been reached.
     * @return {WebSocketClient}
     */
    reconnect(){
        if(!this.maxReconnectAttempts || this.reconnectAttempts < this.maxReconnectAttempts){
            this.reconnectAttempts++;
            this.connect();
        }
        else {
            this.stopAutoReconnect();
        }
        return this;
    }

    /**
     * Ping the web socket
     * @return {WebSocketClient}
     */
    ping(){
        this.lastPingSent = performance.now();
        return this.send({route: "/ping"});
    }

    /**
     * Pong the web socket
     * @return {WebSocketClient}
     */
    pong(){
        return this.send({route: "/pong"});
    }

    /**
     * Record the latency as betweeb 
     * now and when the last ping was sent
     * @return {WebSocketClient}
     */
    recordLatency(){
        this.latency = performance.now() - this.lastPingSent;
        return this;
    }
}