import { extension_webview_userFeedbackEmits } from "@vschat/shared/constants/protocolCommands";
import { AuthActionRtnCodes, AuthActionRtnCodesMessageMap } from "@vschat/shared/interfaces/ApiInterfaces";
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
}