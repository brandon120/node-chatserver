/**
 * Creates a message to send to a server,
 * or parses a message from a server.
 * A message can be passed through multiple routers,
 * so it has a status property. This status property
 * starts at ok, and can move to error, or done.
 * This status reflects the outcome of the last router
 * to handle the message. When set to ok, the last router
 * to handle the message encountered no problems, and other
 * routers are free to also handle the message. When in 
 * error, or done, the next router may determine
 * whether or not it should continue. 
 * The message is serialized into a simple object.
 * The message is deserialized from a simple object.
 * This class should be extended if you want to serialize
 * data in some other way, such as JSON, XML, or other.
 */
class Message {

	/**
	 * Constructor
	 * @param {object} [options]
	 * @param {number} [options.route=null] - command
	 * @param {object} [options.data=null] - data
	 * @param {number} [options.status=Message.status.ok] - status
	 * @return {Message}
	 */
	constructor(options = {}){
		this.route = options.route || "";
		this.data = options.data || {};
		this.status = options.status || Message.status.ok;
		this.timestamp = Date.now();
		return this;
	}
	
    /**
     * Set the route
     * @param {number|string} route 
	 * @return {Message}
     */
    setRoute(route){
        this.route = route;
        return this;
	}
	
	/**
	 * Get the route
	 * @return {number|string}
	 */
	getRoute(){
		return this.route;
	}

    /**
     * Set the status
     * @param {number} status 
	 * @return {Message}
     */
    setStatus(status){
        this.status = status;
        return this;
	}
	
	/**
	 * Set the Message status as done.
	 * This can indicate to other handlers
	 * of the message to ignore it.
	 * @return {Message}
	 */
	setDone(){
		this.status = Message.status.done;
		return this;
    }
    
    /**
     * Get whether the message has been fully 
     * processed by a handler, and should no 
     * longer be handled.
     * @return {boolean}
     */
    isDone(){
        return this.status === Message.status.done;
    }

	/**
	 * Get the status
	 * @return {number|string}
	 */
	getStatus(){
		return this.status;
	}

    /**
     * Set the data
     * @param {*} data 
	 * @return {Message}
     */
    setData(data){
        this.data = data;
        return this;
    }
	
	/**
	 * Get the data
	 * @return {number|string}
	 */
	getData(){
		return this.data;
	}

	/**
	 * Set the message to be an error message
	 * @param {string} [text]
	 * @return {Message}
	 */ 
	setError(text){
		this.status = Message.status.error;
		if(text){
			this.setData(text);
		}
		return this;
	}

	/**
	 * Set the message to be an ok message
	 * @return {Message}
	 */
	setOk(){
		this.status = Message.status.ok;
		return this;
	}

	/**
	 * Serialize the message to an object.
	 * If any message properties are null,
	 * they are not included in the object.
	 * @return {object}
	 */
	toObject(){
		let obj = {
			status: this.status,
			timestamp: this.timestamp
		};

		if(this.route !== null){
			obj.route = this.route;
		}
		if(this.data !== null){
			obj.data = this.data;
		}
		
		return obj;
	}

	/**
	 * Set Message properties from an object.
	 * @param {object} obj
	 * @param {number|string} obj.route
	 * @param {number|string} [obj.status]
	 * @param {*} [obj.data]
	 * @param {number|string} [obj.timestamp]
	 * @return {Message}
	 */
	fromObject(obj){
		if(typeof obj.route !== "undefined"){
			this.route = obj.route;
		}
		if(typeof obj.status !== "undefined"){
			this.status = obj.status;
		}
		if(typeof obj.data !== "undefined"){
			this.data = obj.data;
		}
		if(typeof obj.timestamp !== "undefined"){
			this.timestamp = obj.timestamp;
		}
		return this;
	}

	/**
	 * Serialize the message into a simple object.
	 * @return {object}
	 */
	serialize(){
		return this.toObject();
	}

	/**
	 * Deserialize an object of data and 
	 * set matching Message properties.
	 * @param {*} data
	 * @return {Message}
	 */
	deserialize(data){
		return this.fromObject(data);
	}
}
Message.status = {
	error: 0,
	ok: 1,
	done: 2
};

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
        let msg = new Message({route: "/ping"});
        return this.send(msg.serialize());
    }

    /**
     * Pong the web socket
     * @return {WebSocketClient}
     */
    pong(){
        let msg = new Message({route: "/pong"});
        return this.send(msg.serialize());
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