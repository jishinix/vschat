import { AppViews, NavigationData } from '@vschat/shared/interfaces/WebViewNavigation'
import { EventDispatcher } from '@vschat/shared/Utils/EventDispatcher';

class WebViewNavigationStorage {
    private currentView: AppViews = 'init-direct';
    private currentNavigationData: NavigationData = { chatId: '' };
    private isOpen: boolean = false;

    public eventDispatcher = new EventDispatcher();
    constructor() {

    }

    updateView(view: AppViews, navigationData?: NavigationData) {
        console.log('switch view', view, navigationData);
        this.currentView = view;
        if (navigationData) this.currentNavigationData = navigationData
        this.eventDispatcher.dispatchEvent('updateView', [view, navigationData])
    }

    isInChat(chatId: string) {
        console.log(this.isOpen, this.currentView, this.currentNavigationData, chatId)
        if (!this.isOpen) return false;
        return this.currentView === 'chat' && this.currentNavigationData.chatId === chatId;
    }

    setOpenState(state: boolean) {
        this.isOpen = state;
    }
}

export const webViewNavigationStorage = new WebViewNavigationStorage();