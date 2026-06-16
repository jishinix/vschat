import * as dotenv from 'dotenv';
import { App } from "./services/App";
import findConfig from 'find-config';
import { chatLoader } from './services/Loader/ChatLoader';

dotenv.config({ path: findConfig('.env') || undefined });

const app = new App()
app.init();
