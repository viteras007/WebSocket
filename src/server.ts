import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

const app = express();

//inicializar um servidor http simples
const server = http.createServer(app);

//inicializar a instância do servidor WebSocket
const wss = new WebSocket.Server({ server });
const CLIENTS: any = [];
const TODOSCLIENTES: any = [];


class Cliente {
    id: number;
    name: string;

    constructor(id: number, nome: string) {
        this.id = id;
        this.name = nome;
    }

}
var isAlive = true;


wss.on('connection', (ws: WebSocket) => {

    const cliente = {
        id: CLIENTS.length,
        name: 'User' + CLIENTS.length
    };
    CLIENTS.push(ws);
    TODOSCLIENTES.push(cliente);
    console.log("LISTA DE USUARIOS",TODOSCLIENTES);
    //a conexão está ativa, vamos adicionar um evento simples
    ws.on('pong', () => {
        isAlive = true;
    })
    ws.on('message', (message: string) => {

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

        } else if (cliente.id === 0 || cliente.id === 2) {
            send(message, cliente.name, cliente);
            ws.send(`${cliente.name} -> ${message}`);
        }
        else {
            ws.send("Você não tem permissão!");
        }
    });
    ws.onclose = function (e) {
        console.log("REMOVENDO O ID: ", cliente.id);
        //delete TODOSCLIENTES[cliente.id];
        console.log("LISTA DE USUARIOS",TODOSCLIENTES);
        remove(TODOSCLIENTES,cliente);
        console.log("LISTA DE USUARIOS",TODOSCLIENTES);
        console.log("LISTA DE USUARIOS",TODOSCLIENTES.length);
     };
    //enviar imediatamente um feedback para a conexão de entrada
    ws.send("WELCOME " + cliente.name);
    ws.send(usersOnline());
});

function remove(array, element) {
    const index = array.indexOf(element);
    console.log("POSICAO",index);
    array.splice(index, 1);    
   }


function send(message: string, name: string, user: Cliente) {
    if (user.id === 0) {
        CLIENTS[1].send("Message from " + name + ": " + message);
    }
    if (user.id === 2) {
        CLIENTS[0].send("Message from " + name + ": " + message);
    }
    /*
    //Se for usar Dinamicamente, apenas é preciso pegar o ID do receptor (receptor) atraves de um parametro
    CLIENTS[receptor.id].send("Message from " + user.name + ": " + message);
    */
};
function usersOnline() {
    //const listaCliente = CLIENTS.map(resposta => resposta.name);
    let message = " USUARIOS ONLINE"
    for (var i = 0; i < TODOSCLIENTES.length; i++) {
        message += "\n=>" + TODOSCLIENTES[i].name + " ";
    }
    return message;
}

//start our server
server.listen(8999, () => {
    console.clear();
    console.log(`Server started on port 8999 :)`);
});
