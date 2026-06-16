import { Injectable, signal } from '@angular/core';
import { ChatList } from '@vschat/shared/interfaces/Chat';
import { DecrypredMessageData } from '@vschat/shared/interfaces/Messages';

export type AppViews = 'init-direct' | 'login' | 'register' | 'chatlist' | 'chat' | 'friends';

export interface ViewSwitchMessage {
    success?: string;
    error?: string;
}

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    currentView = signal<AppViews>('init-direct');

    extradata = {
        chatId: signal<string>(''),
        addMsg: undefined as (((msg: DecrypredMessageData) => void) | undefined),
        gotChatLookup: undefined as (((chats: ChatList) => void) | undefined)
    }

    switchChat(chatId: string) {
        this.extradata.chatId.set(chatId);
        this.extradata.addMsg = undefined;
        this.switchView('chat');
    }

    generalSuccess = signal<string>('');
    generalError = signal<string>('');

    switchView(view: AppViews, viewSwitchMessage: ViewSwitchMessage = {}) {
        this.generalSuccess.set(viewSwitchMessage.success || '');
        this.generalError.set(viewSwitchMessage.error || '');

        this.currentView.set(view);
    }
}