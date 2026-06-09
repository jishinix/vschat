import { Component, EventEmitter, Output } from '@angular/core';
import { ChatList } from '@vschat/shared/interfaces/Chat';
import { ChatApi } from '../../services/ExtensionApi/ChatApi';
import { ChatOverlay } from '../../components/chat-overlay/chat-overlay';
import { NavigationService } from '../../services/NavigationService';

@Component({
    selector: 'app-chatlist',
    imports: [
        ChatOverlay
    ],
    templateUrl: './chatlist.html',
    styleUrl: './chatlist.css',
})
export class Chatlist {
    public chats: ChatList = [];

    constructor(private chatApi: ChatApi, public navigation: NavigationService) { }

    ngOnInit(): void {
        this.chatApi.getChatList().then(chatList => {
            this.chats = chatList;
        })
    }
}