const NodeServer = require('@voliware/node-server');

/**
 * Chat Server
 * @extends {NodeServer.Server}
 */
class ChatServer extends NodeServer.Server {

	/**
	 * Constructor
	 * @param {object} [options]
	 * @param {boolean} [options.addClientsToGeneralChat=true]
	 * @return {ChatServer}
	 */
	constructor(options){
		let defaults = {
			name: 'ChatServer',
			addClientsToGeneralChat: true
        };
		super(Object.extend(defaults, options));
		this.addClientsToGeneralChat = defaults.addClientsToGeneralChat;
		this.generalChat = this.createGeneralChatRoom();
		return this;
	}

    /**
     * Attach handlers to a Client.
     * @param {Client} client 
     * @return {ChatServer}
     */
    attachClientHandlers(client){
		super.attachClientHandlers(client);
		if(this.addClientsToGeneralChat){
			this.generalChat.addClient(client.id, client);
		}
		return this;
	}

	/**
	 * Create the infamous General chat
	 * @return {ChatServer}
	 */
	createGeneralChatRoom(){
		let room = new NodeServer.Room({
			broadcastLeavers: false,
			owner: 'admin',
            name: ChatServer.generalChatName,
            logHandle: this.name
		});
		this.roomManager.addRoom(ChatServer.generalChatName, room);
		return room;
	}
}
ChatServer.generalChatName = "General";

module.exports = ChatServer;