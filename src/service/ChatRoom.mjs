export default class ChatRoom {
    #clients   // <client name>: <array of connections(contacts)>
    #connections  // <connection id>: <{client: <clientName>, socket: <web socket>}>
    constructor() {
        this.#clients = {};
        this.#connections = {};
    }
    
    addConnection(clientName, connectionId, ws) {
        this.#connections[connectionId] = {client: clientName, socket: ws};
        if (this.#clients[clientName]) {  //if array is present
            this.#clients[clientName].push(connectionId); //present connections, just add new
        } else {
            this.#clients[clientName] = [connectionId]   //new connection
        }
    } 

    removeConnection(connectionId) {
        const client = this.#connections[connectionId].client;
        const clientConnections = this.#clients[client]//all connections for this client
        const index = clientConnections.findIndex(id => id == connectionId); //index 
        if (index < 0) {   //does not exist 
            throw `illegal state with connection ${connectionId}`
        }
        clientConnections.splice(index, 1);

        if (clientConnections.length == 0) {
            delete this.#clients[client];
        }
        delete this.#connections[connectionId]   //remove info about connection after closing 
    }


    getClientWebSockets(clientName) {
        let res = [];
        if (this.#clients[clientName]) {
            res = this.#clients[clientName].map(connectionId => this.#connections[connectionId].socket)  //all sockets for this client
        }
        return res;

    }

    getAllClients() {
        return Object.keys(this.#clients)  //return name of clients 
    }

    getAllWebSockets() {
        return Object.values(this.#connections).map(c => c.socket) //perform from object array of sockets
    }

}