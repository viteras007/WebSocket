"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const app = express();
//inicializar um servidor http simples
const server = http.createServer(app);
//inicializar a instância do servidor WebSocket
const wss = new WebSocket.Server({ server });
const CLIENTS = [];
const TODOSCLIENTES = [];
class Cliente {
    constructor(id, nome) {
        this.id = id;
        this.name = nome;
    }
}
var isAlive = true;
var ReceptorID = 0;
app.get('ws://localhost:8999/private/:id', function (req, res, next) {
    ReceptorID = req.params.id;
    console.log("ENTROU PELO URL");
    next();
}, function (req, res, next) {
    res.send('User Info');
});
wss.on('connection', (ws) => {
    const cliente = {
        id: CLIENTS.length,
        name: 'User' + CLIENTS.length
    };
    CLIENTS.push(ws);
    TODOSCLIENTES.push(cliente);
    console.log("LISTA DE USUARIOS", TODOSCLIENTES);
    //a conexão está ativa, vamos adicionar um evento simples
    ws.on('pong', () => {
        isAlive = true;
    });
    ws.on('message', (message) => {
        console.log('received: %s', message, "- USUARIOS:", CLIENTS.length);
        //log mensagem recebida e enviá-la de volta ao cliente
        const broadcastRegex = /^broadcast\:/;
        if (broadcastRegex.test(message)) {
            message = message.replace(broadcastRegex, '');
            //enviar de volta a mensagem para os outros clientes
            wss.clients
                .forEach(client => {
                if (client != ws) {
                    client.send(`Hello, broadcast message -> ${message}`);
                }
            });
        }
        else if (cliente.id === 0 || cliente.id === 2) {
            send(message, cliente.name, cliente, ReceptorID);
            ws.send(`${cliente.name} -> ${message}`);
        }
        else {
            ws.send("Você não tem permissão!");
        }
    });
    ws.onclose = function (e) {
        console.log("REMOVENDO O ID: ", cliente.id);
        //delete TODOSCLIENTES[cliente.id];
        console.log("LISTA DE USUARIOS", TODOSCLIENTES);
        remove(TODOSCLIENTES, cliente);
        console.log("LISTA DE USUARIOS", TODOSCLIENTES);
        console.log("LISTA DE USUARIOS", TODOSCLIENTES.length);
    };
    //enviar imediatamente um feedback para a conexão de entrada
    ws.send("WELCOME " + cliente.name);
    ws.send(usersOnline());
});
function remove(array, element) {
    const index = array.indexOf(element);
    console.log("POSICAO", index);
    array.splice(index, 1);
}
function send(message, name, user, idReceptor) {
    /*
    if (user.id === 0) {
        CLIENTS[2].send("Message from " + name + ": " + message);
    }
    if (user.id === 2) {
        CLIENTS[0].send("Message from " + name + ": " + message);
    }
    */
    CLIENTS[idReceptor].send("Message from " + name + ": " + message);
    /*
    //Se for usar Dinamicamente, apenas é preciso pegar o ID do receptor (receptor) atraves de um parametro
    CLIENTS[receptor.id].send("Message from " + user.name + ": " + message);
    */
}
;
function usersOnline() {
    //const listaCliente = CLIENTS.map(resposta => resposta.name);
    let message = " USUARIOS ONLINE:";
    for (var i = 0; i < TODOSCLIENTES.length; i++) {
        message += " " + TODOSCLIENTES[i].name + ", ";
    }
    return message;
}
app.get('/allOnline', function (req, res) {
    res.send(usersOnline());
});
//start our server
server.listen(8999, () => {
    console.clear();
    console.log(`Server started on port 8999 :)`);
});
//# sourceMappingURL=server.js.map