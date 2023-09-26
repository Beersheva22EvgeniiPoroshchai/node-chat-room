import crypto from 'crypto';
import express from 'express';
import expressWs from "express-ws";
import ChatRoom from './service/ChatRoom.mjs';
import { users } from './routes/users.mjs';
import bodyParser from 'body-parser'


const app = express();
app.use(bodyParser.json())
expressWs(app);  

const chatRoom = new ChatRoom();
app.get('/contacts', (req, res) => {
    res.send(chatRoom.getAllClients())
});

app.ws('/contacts/websocket', (ws,req) => {
    const clientName = ws.protocol || req.query.clientName;  //req.query -> `?local....`; req.params -> `/${local...}` in url line
    if (!clientName) {  //ws.protocol: name of client
        ws.send(`must be nickname`);
        ws.close();
    } else {
        processConnection(clientName, ws);   
        }
    })

app.ws('/contacts/websocket/:clientName', (ws,req) => {
    const clientName = req.params.clientName;
    processConnection(clientName, ws);   
    })


   

app.listen(8080, () => {
    console.log('server is listening on port 8080');
});

 app.use('/users', users);

function processConnection(clientName, ws) {
    const connectionId = crypto.randomUUID();
        chatRoom.addConnection(clientName, connectionId, ws);
        ws.on('close', () => chatRoom.removeConnection(connectionId));   //or 'close', chatRoom.removeConnection.bind(chatRoom, connectionId)
        // ws.on('message', message => chatRoom.getAllWebSockets().forEach(ws => ws.send(message)))
      //  ws.on('message', processMessage)  //pass functional object: processMessage, not calling function
        ws.on('message', processMessage.bind(undefined, clientName, ws)) 
    }

    function processMessage(clientName, ws, message) {
        try {
            const messageObj = JSON.parse(message.toString());
            const to = messageObj.to;
            const text = messageObj.text;
            if (!text) {
                ws.send('your message is empty')
            } else {
                const objSent = JSON.stringify({from: clientName, text});
                if (!to || to === 'all') {
                sendAll(objSent);
            } else {
                sendClient(objSent, to, ws);
            }
            }
           
        } catch (error) {
            ws.send('wrong message structure')
        }


        function sendAll(message) {
            chatRoom.getAllWebSockets().forEach(ws => ws.send(message));
        }
        function sendClient(message, client, socketFrom) {
            const clientSockets = chatRoom.getClientWebSockets(client);
            if (clientSockets.length == 0) {
                socketFrom.send(client + ' contact does not exist')
            } else {
                clientSockets.forEach(s => s.send(message))
            }
        }

    }







