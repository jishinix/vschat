import * as dotenv from 'dotenv';
import { App } from "./services/App";
import findConfig from 'find-config';

dotenv.config({ path: findConfig('.env') || undefined });

const app = new App()
app.init();
