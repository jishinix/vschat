import { inject, Injector } from "@angular/core";
import { extension_webview_userFeedbackEmits } from "@vschat/shared/constants/protocolCommands";
import { AuthActionRtnCodes, AuthActionRtnCodesMessageMap } from "@vschat/shared/interfaces/ApiInterfaces";
import { AppViews, NavigationData } from "@vschat/shared/interfaces/WebViewNavigation";
import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import { NavigationService } from "../NavigationService";

export class UserFeedbackEmits extends NamespaceHandler<typeof extension_webview_userFeedbackEmits> {
    private injector = inject(Injector);
    get navigation() {
        return this.injector.get(NavigationService)
    }
    constructor() {
        super('userFeedback', extension_webview_userFeedbackEmits);
    }
    handles = {
        'updateView': data => {
            this.navigation.switchView(data.view, {}, data.navigationData)
            return null;
        }
    } satisfies NamespaceHandler<typeof extension_webview_userFeedbackEmits>['handles'];

    uuidCopied() {
        this.emit('UUIDCopied');
    }

    updateView(view: AppViews, data: NavigationData) {
        this.emit('ViewUpdate', { view, navigationData: data });
    }
}