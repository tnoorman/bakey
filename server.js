const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ port: 1482 });

wss.on('connection', () => {
    console.log("Connected");
})

wss.on('close', () => {
    console.log("Closed")
})

wss.on('message', (data) => {
    console.log(data);
})