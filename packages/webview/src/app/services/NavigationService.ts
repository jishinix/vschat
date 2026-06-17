import { inject, Injectable, Injector, signal, WritableSignal } from '@angular/core';
import { AppViews, NavigationData } from '@vschat/shared/interfaces/WebViewNavigation';
import { ExtensionBackendCommunication } from './ExtensionApi/ExtensionBackendCommunication';



export interface ViewSwitchMessage {
    success?: string;
    error?: string;
}


interface SignalNavigationData extends Omit<NavigationData, 'chatId'> {
    chatId: WritableSignal<string>;
}

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    private _ebc: ExtensionBackendCommunication | null = null;
    private injector = inject(Injector);
    currentView = signal<AppViews>('init-direct');

    navigationData: SignalNavigationData = {
        chatId: signal<string>('')
    }

    constructor() {
    }

    get ebc() {
        if (this._ebc) return this._ebc;
        this._ebc = this.injector.get(ExtensionBackendCommunication);
        return this._ebc
    }

    getRawNavigationData(): NavigationData {
        return {
            chatId: this.navigationData.chatId()
        }
    }

    generalSuccess = signal<string>('');
    generalError = signal<string>('');

    switchView(view: AppViews, viewSwitchMessage: ViewSwitchMessage = {}, navigationData: Partial<NavigationData> = {}) {
        this.generalSuccess.set(viewSwitchMessage.success || '');
        this.generalError.set(viewSwitchMessage.error || '');


        for (const [key, value] of Object.entries(navigationData)) {
            if (key in this.navigationData && value !== undefined) {
                const targetSignal = this.navigationData[key as keyof SignalNavigationData];
                if (typeof targetSignal === 'function' && 'set' in targetSignal) {
                    targetSignal.set(value);
                }
            }
        }

        this.ebc.userFeedback.updateView(view, this.getRawNavigationData());

        this.currentView.set(view);
    }
}