/**
 * Chat room message template
 * @extends {Template}
 */
class ChatRoomMessageTemplate extends Template {

    /**
     * Constructor
     * @return {ChatRoomMessageTemplate}
     */
    constructor(){
        super({
            elements: {
                avatar: '[data-name="avatar"]',
                user: '[data-name="user"]',
                text: '[data-name="text"]'
            }
        });
        return this;
    }

    /**
     * Process render data
     * @param {object} data 
     * @return {object}
     */
    processRenderData(data){
        data.user = data.user + ":";
        return data;
    }
}
customElements.define('template-chatroom-message', ChatRoomMessageTemplate);

/**
 * Chat room message template manager
 * @extends {ElementManager}
 */
class ChatRoomMessageTemplateManager extends ElementManager {

    /**
     * Constructor
     * @param {HTMLElement} wrapper 
     * @return {ChatRoomMessageTemplateManager}
     */
    constructor(wrapper){
        let template = document.getElementById('chatroom-message-template');
        super(wrapper, template, {
            removeTemplate: false,
            removeDeadTemplates: false
        });
        return this;
    }

    /**
     * Append a single message.
     * @param {string} messageId
     * @param {object} message
     * @return {ElementManager} 
     */
    appendMessage(messageId, message){
        return this.renderSingle(messageId, message);
    }
}

/**
 * Chat room user template.
 * Represents a user in a chat room.
 * @extends {Template}
 */
class ChatRoomUserTemplate extends Template {

    /**
     * Constructor
     * @return {ChatRoomUserTemplate}
     */
    constructor(){
        super({
            elements: {
                avatar: '[data-name="avatar"]',
                name: '[data-name="name"]'
            }
        });
        return this;
    }

    /**
     * Process render data.
     * Provide a default avatar if there is none.
     * @param {object} data 
     * @extends {Template}
     */
    processRenderData(data){
        if(!data.avatar || data.avatar === ""){
            data.avatar = "<img src='/img/avatar.png'>"
        }
        return data;
    }
}
customElements.define('template-chatroom-user', ChatRoomUserTemplate);

/**
 * Chat room user template manager
 * @extends {ElementManager}
 */
class ChatRoomUserTemplateManager extends ElementManager {

    /**
     * Constructor
     * @param {HTMLElement} wrapper 
     * @return {ChatRoomUserTemplateManager}
     */
    constructor(wrapper){
        let template = document.getElementById('chatroom-user-template');
        super(wrapper, template, {
            removeTemplate: false,
            removeDeadTemplates: false
        });
        return this;
    }

    /**
     * Append a single client to the list.
     * @param {string} clientId
     * @param {object} client
     * @return {ChatRoomUserTemplateManager} 
     */
    appendClient(clientId, client){
        this.renderSingle(clientId, client);
        return this;
    }

    /**
     * Remove a client from the client list
     * @param {string} clientId
     * @return {ChatRoomUserTemplateManager}
     */
    removeClient(clientId){
        this.removeElement(clientId);
        return this;
    }
}

/**
 * Chat room template.
 * @extends {Template}
 */
class ChatRoomTemplate extends Template {

    /**
     * Constructor
     * @param {object} [options={}
     * @return {ChatRoomTemplate}
     */
    constructor(options = {}){
        let defaults = {
            elements: {
                // header
                header: '.chatroom-header',
                icon: '.chatroom-icon',
                img: '.chatroom-img',
                lock: '.chatroom-ock',
                info: '.chatroom-info',
                users: '.chatroom-users',
                clientCount: '[data-name="clientCount"]',
                name: '[data-name="name"]',
                // room
                room: '.chatroom-room',
                chat: '.chatroom-chat',
                userList: '.chatroom-userlist',
                textInput: '[name="text"]',
                submitButton: '[type="submit"]'
            }
        };
        super(Object.extend(defaults, options));
        this.userManager = new ChatRoomUserTemplateManager(this.elements.userList);
        this.messageManager = new ChatRoomMessageTemplateManager(this.elements.chat);
        return this;
    }

    /**
     * Connected callback
     */
    connectedCallback(){
        super.connectedCallback();
        this.attachInputHandlers();
        this.attachDomHandlers();
        this.attachButtonHandlers();
    }

    /**
     * Attach input handlers
     * @return {ChatRoomTemplate}
     */
    attachInputHandlers(){
        let self = this;
        
        /**
         * If enter key is pressed, submit the chat text
         * @param {KeyboardEvent} event 
         */
        function documentOnEnterKey(event){
            if(event.keyCode === 13){
                self.submit();
            }
        }
        this.elements.textInput.addEventListener('focus', function(){
            document.addEventListener('keyup', documentOnEnterKey);
        });
        this.elements.textInput.addEventListener('blur', function(){
            document.removeEventListener('keyup', documentOnEnterKey)
        });
        return this;
    }

    /**
     * Attach DOM handlers
     * @return {ChatRoomTemplate}
     */
    attachDomHandlers(){
        this.elements.header.addEventListener('click', function(){
            Template.toggle(self.elements.room);
        });
        return this;
    }

    /**
     * Attach button handlers.
     * @return {ChatRoomTemplate}
     */
    attachButtonHandlers(){
        let self = this;
        this.elements.submitButton.addEventListener('click', function(){
            self.submit();
        });
        return this;
    }


    /**
     * Serialize the message
     * @return {object}
     */
    serializeMessage(){
        return {
            text: this.elements.textInput.value
        };
    }

    /**
     * Clear the text input
     * @return {ChatRoomTemplate}
     */
    clearInput(){
        this.elements.textInput.value = "";
        return this;
    }

    /**
     * Scroll the chat area to the bottom
     * @return {ChatRoomTemplate}
     */
    scrollChatToBottom(){
        this.elements.chat.scrollTop = this.elements.chat.scrollHeight - this.elements.chat.clientHeight;
        return this;
    }

    /**
     * Serialize and submit the message.
     * Clear the input.
     * @return {ChatRoomTemplate}
     */
    submit(){
        let message = this.serializeMessage();
        this.emit('message', message);
        this.clearInput();
        return this;
    }

    /**
     * Process data to be rendered
     * @param {object} data
     * @param {number} data.maxClient
     * @return {object}
     */
    processRenderData(data){
        data.maxClients = data.maxClients ? "/" + data.maxClients : "";
        return data;
    }

    /**
     * Render the client count
     * @param {number} count
     * @return {ChatRoomTemplate}
     */
    renderClientCount(count){
        this.elements.clientCount.innerHTML = count;
        return this;
    }

    /**
     * Append a message to the chat log
     * @param {object} message 
     * @return {ChatRoomTemplate}
     */
    appendMessage(message){
        this.messageManager.appendMessage(message.id, message);
        this.scrollChatToBottom();
        return this;
    }

    /**
     * Append a client to the client list
     * @param {object} client
     * @return {ChatRoomTemplate}
     */
    appendClient(client){
        this.userManager.appendClient(client.id, client);
        this.cachedData.clientCount++;
        this.renderClientCount(this.cachedData.clientCount);
        return this;
    }

    /**
     * Remove a client from the client list
     * @param {object} client
     * @return {ChatRoomTemplate}
     */
    removeClient(id){
        this.userManager.removeClient(id);
        this.cachedData.clientCount--;
        this.renderClientCount(this.cachedData.clientCount);
        return this;
    }

    /**
     * Render the template
     * @param {object} data 
     * @return {ChatRoomTemplate}
     */
    render(data){
        super.render(data);
        let clients = ElementManager.dataArrayToDataObject(data.clients);
        this.userManager.render(clients);
        this.messageManager.render(data.messages);
        return this;
    }
}
customElements.define('template-chatroom', ChatRoomTemplate);

/**
 * Chat room manager
 * @extends {ElementManager}
 */
class ChatRoomTemplateManager extends ElementManager {

    /**
     * Constructor
     * @return {ChatRoomTemplateManager}
     */
    constructor(){
        let wrapper = document.getElementById('chatroom-list');
        let template = document.getElementById('chatroom-template');
        super(wrapper, template, {
            removeTemplate: false
        });
        return this;
    }

    attachElementHandlers(chatroom){
        chatroom.on('message', function(message){
            console.log(message);
        })
    }
}

/**
 * Chat module
 * @extends {EventSystem}
 */
class Chat extends EventSystem  {

    /**
     * Constructor
     * @return {Chat}
     */
    constructor(){
        super();
        this.wrapper = document.getElementById('chat');
        this.webSocketClient = new WebSocketClient({
            ip: "ws://localhost",
            port: 5001,
        });
        this.attachWebSocketClientHandlers();
        this.chatRoomManager = new ChatRoomTemplateManager();
        return this;
    }

    /**
     * Attach handlers to the web socket client
     * @return {Chat}
     */
    attachWebSocketClientHandlers(){
        let self = this;
        this.webSocketClient.on('open', function(){
            self.getChatRooms();
        });
        this.webSocketClient.on('message', function(data){
            self.routeMessage(data);
        });
        return this;
    }

   /**
    * Route a message from the web socket client
    * @param {object} message 
    * @param {number} message.status
    * @param {number} message.route
    * @param {object} [message.data]
    * @return {ChatRoomTemplate}
    */
   routeMessage(message){
       if(message.status === 0){
           console.error("bad message");
           console.error(message);
           return this;
       }
       return this;
   }

    /**
     * Send a message through the web socket
     * @param {object} message 
     * @return {Chat}
     */
    sendMessage(message){
        this.webSocketClient.sendJson(message);
        return this;
    }

    /**
     * Get all chat rooms
     * @return {Chat}
     */
    getChatRooms(){
        let self = this;
        fetch("/rooms")
            .then(function(response){
                return response.json();
            })
            .then(function(data){
                self.renderChatRooms(data);
            })
            .catch(function(e){
                console.error(e);
            });
        return this;
    }
    
    /**
     * Render chat rooms
     * @param {object[]} rooms 
     * @return {Chat}
     */
    renderChatRooms(rooms){
        this.chatRoomManager.render(rooms);
        return this;
    }

    /**
     * Toggle the visibility of the module
     * @return {Chat}
     */
    toggle(state){
        Template.toggle(this.wrapper, state);
        return this;
    }

    /**
     * Initialize the module
     * @return {Chat}
     */
    initialize(){
        this.webSocketClient.connect();
        return this;
    }
}