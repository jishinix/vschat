import { Component, signal } from '@angular/core'; import { CommonModule } from '@angular/common';
import { Login } from './views/login/login';
import { Chat } from './views/chat/chat';
import { Chatlist } from './views/chatlist/chatlist';
import { Register } from './views/register/register';

type AppViews = 'login' | 'register' | 'chatlist' | 'chat'

export interface ViewSwitchMessage {
	succsess?: string,
	error?: string
}

@Component({
	selector: 'app-root',
	imports: [
		CommonModule,
		Login,
		Chat,
		Chatlist,
		Register
	],
	templateUrl: './app.html',
	styleUrl: './app.css'
})
export class App {
	protected readonly title = signal('webview');
	currentView: AppViews = 'login';
	generalSuccsess: string = "";
	generalError: string = "";

	switchView(view: AppViews, viewSwitchMessage: ViewSwitchMessage = {}) {
		this.generalSuccsess = viewSwitchMessage.succsess || '';
		this.generalError = viewSwitchMessage.error || '';

		this.currentView = view;
	}
}
