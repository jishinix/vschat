import express from 'express';
import { createServer, Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { ClientCommunication } from './ClientApi/ClientCommunication';
import { userLoader } from './Loader/UserLoader';
import { User } from '../models/User';
import { sessionManager } from './SessionManager';

interface SocketData {
    getUser: () => Promise<User | null>;
    userId: string,
    protocol: ClientCommunication;
}

export type socketWithDataType = Socket<any, any, any, SocketData>;

class WebsocketManager {
    private app: express.Express;
    private httpServer: HttpServer;
    private io: Server<any, any, any, SocketData>;
    private userSocketMap = new Map<string, socketWithDataType[]>;

    constructor() {
        this.app = express();
        this.httpServer = createServer(this.app);
        this.io = new Server(this.httpServer, {
            cors: {
                origin: "*" // In der Produktion spezifischer konfigurieren!
            }
        });

        this.io.use(async (socket: socketWithDataType, next) => {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error("Authentication error: No token provided"));
            }


            const userId: string = await sessionManager.getUserIdByToken(token);// implementierung folgt

            if (!userId) {
                return next(new Error("Authentication error: Invalid token"));
            }

            /*
                niemals eine referenz auf dem user speichern, das übernimmt der cache
                wenn der cache die referenz nach 10 min verwirrft und eine andere instanz denn user lädt,
                gibt es 2 instanzen.
            */
            socket.data.getUser = async () => {
                const user = (await userLoader.getData([userId])).get(userId)!;
                if (!user) {
                    socket.data.protocol?.coreHandler.userNotFound().finally(() => {
                        socket.disconnect();
                    })
                    return null
                }
                return user
            };
            socket.data.userId = userId;

            next();
        });


        this.io.on('connection', async (socket: socketWithDataType) => {
            const clientComm = new ClientCommunication(socket);
            socket.data.protocol = clientComm

            const user = await socket.data.getUser();
            if (!user) return;
            const id = user.data.id;
            console.log(`Client verbunden: [${socket.id}] (User: ${user.data.username})`);

            clientComm.initializeUserAuthHandler()


            clientComm.initializeBaseHandlers([
            ]);
            const userSockets = this.getUserSockets(id);
            userSockets.push(socket);
            this.userSocketMap.set(id, userSockets);

            socket.on('disconnect', () => {
                console.log(`Client getrennt: [${socket.id}] (User: ${user.data.username})`);
                const userSockets = this.getUserSockets(id).filter(e => e !== socket);
                if (!userSockets.length) this.userSocketMap.delete(id);
                else this.userSocketMap.set(id, userSockets);
            });
        });


        this.httpServer.listen(7011, () => {
            console.log("Server läuft auf Port 3000");
        });
    }

    public getUserSockets(userId: string): socketWithDataType[] {
        const sockets = this.userSocketMap.get(userId);
        return sockets ? [...sockets] : [];
    }
}


export const websocketManager = new WebsocketManager();