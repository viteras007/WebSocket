"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const app = express();
const ws = require('express-ws')(app);
const http = require("http");
const WebSocket = require("ws");
const utils = require('./src/utils');
utils.teste();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const router = express.Router();
class Cliente {
    constructor(id, nome) {
        this.id = id;
        this.name = nome;
    }
}
const TODOSCLIENTES = [];
let connects = [];
/*
app.ws('/', (ws, req) => {
    ws.on('open', () => {
        console.log("USUARIO CONECTOU");
    })
});*/
app.ws('/private/:id', (ws, req) => {
    const cliente = {
        id: connects.length,
        name: 'User' + connects.length
    };
    TODOSCLIENTES.push(cliente);
    connects.push(ws);
    console.log("Clientes", TODOSCLIENTES);
    console.log("ID", req.params.id);
    ws.on('message', message => {
        console.log('Received -', message);
        connects.forEach(socket => {
            if (req.params.id) {
                socket.send(message);
            }
        });
    });
    ws.on('close', () => {
        connects = connects.filter(conn => {
            return (conn === ws) ? false : true;
        });
    });
});
app.ws('/public/', (ws, req) => {
    connects.push(ws);
    ws.on('message', message => {
        console.log('Received -', message);
        connects.forEach(socket => {
            socket.send(message);
        });
    });
    ws.on('close', () => {
        connects = connects.filter(conn => {
            return (conn === ws) ? false : true;
        });
    });
});
router.ws('/echo2', (ws, req) => {
    ws.on('message', (msg) => {
        console.log('rota 2');
        ws.send(msg);
    });
});
function remove(array, element) {
    const index = array.indexOf(element);
    console.log("POSICAO", index);
    array.splice(index, 1);
}
function send(message, name, user) {
    if (user.id === 0) {
        CLIENTS[2].send("Message from " + name + ": " + message);
    }
    if (user.id === 2) {
        CLIENTS[0].send("Message from " + name + ": " + message);
    }
    //CLIENTS[idReceptor].send("Message from " + name + ": " + message);
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
app.use("/", router);
app.listen(3000, () => {
    console.log('Server ON', 3000);
});
//# sourceMappingURL=index.js.map