import { Injectable, signal } from '@angular/core';

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

    generalSuccess = signal<string>('');
    generalError = signal<string>('');

    switchView(view: AppViews, viewSwitchMessage: ViewSwitchMessage = {}) {
        this.generalSuccess.set(viewSwitchMessage.success || '');
        this.generalError.set(viewSwitchMessage.error || '');

        this.currentView.set(view);
    }
}