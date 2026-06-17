import { Component, Injectable, signal } from '@angular/core'; import { CommonModule } from '@angular/common';
import { Login } from './views/login/login';
import { Chat } from './views/chat/chat';
import { Chatlist } from './views/chatlist/chatlist';
import { Register } from './views/register/register';
import { NavigationService } from './services/NavigationService';
import { Friends } from './views/friends/friends';
import { InitDirect } from './init-direct/init-direct';

@Injectable({
	providedIn: 'root'
})
@Component({
	selector: 'app-root',
	imports: [
		CommonModule,
		Login,
		Chat,
		Chatlist,
		Register,
		Friends,
		InitDirect
	],
	templateUrl: './app.html',
	styleUrl: './app.css'
})
export class App {
	constructor(public navigation: NavigationService) { }

	ngOnDestroy() {
	}
}
