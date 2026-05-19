import { Component, signal } from '@angular/core'; import { CommonModule } from '@angular/common';
import { Login } from './views/login/login';
import { Chat } from './views/chat/chat';
import { Chatlist } from './views/chatlist/chatlist';
import { Register } from './views/register/register';

type AppViews = 'login' | 'register' | 'chatlist' | 'chat'

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

	switchView(view: AppViews) {
		this.currentView = view;
	}
}
