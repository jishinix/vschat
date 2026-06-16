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

    navigationData = {
        chatId: signal<string>('')
    }

    switchChat(chatId: string) {
        this.navigationData.chatId.set(chatId);
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