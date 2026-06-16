import { Component, EventEmitter, Output, signal } from '@angular/core';
import { ChatList, ChatListItem } from '@vschat/shared/interfaces/Chat';
import { ChatApi } from '../../services/ExtensionApi/ChatApi';
import { ChatOverlay } from '../../components/chat-overlay/chat-overlay';
import { NavigationService } from '../../services/NavigationService';
import { UserReference } from '@vschat/shared/interfaces/User';
import { ExtensionBackendCommunication } from '../../services/ExtensionApi/ExtensionBackendCommunication';

@Component({
    selector: 'app-chatlist',
    imports: [
        ChatOverlay
    ],
    templateUrl: './chatlist.html',
    styleUrl: './chatlist.css',
})
export class Chatlist {
    public chats = signal<ChatList>([]);

    constructor(private ebc: ExtensionBackendCommunication, public navigation: NavigationService) { }

    ngOnInit(): void {
        this.ebc.chat.getChatList().then(async chatList => {
            const user = await this.ebc.user.getLogedInUser();
            chatList.map(async e => await this.getChatName(e, user.user?.id || ''))
            this.chats.set(chatList);
            console.log(this.chats())
        })
        this.navigation.extradata.gotChatLookup = async (chats: ChatList) => {
            console.log(chats, this.chats);
            const user = await this.ebc.user.getLogedInUser();
            chats.map(async e => await this.getChatName(e, user.user?.id || ''))
            this.chats.set(chats);
        }
    }

    async getChatName(chat: ChatListItem<UserReference>, userId: string) {
        if (chat.name) return chat;

        chat.name = chat.participants.filter(e => e.id != userId).map(e => e.username).join(', ')

        return chat;
    }

    async openChat(chat: ChatListItem<UserReference>) {
        this.navigation.switchChat(chat.id)
    }
}