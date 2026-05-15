import { authApi } from './ExtensionApi/AuthApi.js'
import { views } from './views.js';

import './chat.css'

interface VsCodeApi {
    postMessage(message: any): void;
    getState(): any;
    setState(state: any): void;
}

declare function acquireVsCodeApi(): VsCodeApi;


const app = document.getElementById('app');
if (app) {
    const isLogedIn = await authApi.getLoginState();
    if (!isLogedIn) {
        views.login(app);
    }
}