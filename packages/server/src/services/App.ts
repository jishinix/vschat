import 'dotenv/config';
import session from "express-session";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import fs from 'fs';
import path from 'path';
import { pathToFileURL, fileURLToPath } from "url";
import http from 'http';
import { route } from '../routes/authRoutes';
import { websocketManager } from './WebsocketManager';


export class App {
    private app: Express;
    private websocketManager;

    constructor() {
        this.app = express();
        this.websocketManager = websocketManager;
    }


    private async initRoutes() {
        const folderPath = path.join(__dirname, '..', 'routes')
        if (!fs.existsSync(folderPath)) return;

        const files = fs.readdirSync(folderPath);
        const validFiles = files.filter(file => {
            const isSpec = file.endsWith('.test.ts') || file.endsWith('.spec.ts');
            const isSource = file.endsWith('.ts') || file.endsWith('.js');
            return isSource && !file.endsWith('.d.ts') && !isSpec;
        });

        for (const file of validFiles) {
            const filePath = path.join(folderPath, file);
            try {
                const { route } = await import(pathToFileURL(filePath).href) as { route: (app: Express) => void };
                if (route) {
                    route(this.app);
                }
            } catch (err) {
                console.error(`[${file}] Fehler beim Laden von ${file}:`, err);
            }
        }
    }

    async init() {


        this.app.use(express.urlencoded({ extended: false }))
        this.app.use(express.json({ limit: '50mb' }))
        this.app.use((req, res, next) => {
            console.log(`${req.method} ${req.url}`);
            next();
        });
        this.app.use(session({
            secret: "8VQ1JBxB4X1aQ^N4AgPUiqIqx*5!%Fur",
            resave: false,
            saveUninitialized: false
        }))
        this.app.use(cookieParser(`8VQ1JBxB4X1aQ^N4AgPUiqIqx*5!%Fur`))

        //await this.initRoutes() // geht durch bundling nicht mehr
        route(this.app);


        var httpServer = http.createServer(this.app);
        httpServer.listen(process.env.HTTP_PORT, () => {
            console.log(`🚀 Server läuft auf url localhost:${process.env.HTTP_PORT}`);
        });
    }
}
