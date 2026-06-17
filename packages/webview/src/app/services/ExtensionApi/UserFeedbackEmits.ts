import { extension_webview_userFeedbackEmits } from "@vschat/shared/constants/protocolCommands";
import { AuthActionRtnCodes, AuthActionRtnCodesMessageMap } from "@vschat/shared/interfaces/ApiInterfaces";
import { AppViews, NavigationData } from "@vschat/shared/interfaces/WebViewNavigation";
import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";

export class UserFeedbackEmits extends NamespaceHandler<typeof extension_webview_userFeedbackEmits> {
    constructor() {
        super('userFeedback', extension_webview_userFeedbackEmits);
    }
    handles = {
    } satisfies NamespaceHandler<typeof extension_webview_userFeedbackEmits>['handles'];

    uuidCopied() {
        this.emit('UUIDCopied');
    }

    updateView(view: AppViews, data: NavigationData) {
        this.emit('ViewUpdate', { view, navigationData: data });
    }
}