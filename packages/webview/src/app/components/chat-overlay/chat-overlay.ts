import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { NavigationService } from '../../services/NavigationService';
import { PrivateWebviewUser } from '@vschat/shared/interfaces/User';
import { ExtensionBackendCommunication } from '../../services/ExtensionApi/ExtensionBackendCommunication';

@Component({
    selector: 'app-chat-overlay',
    imports: [],
    templateUrl: './chat-overlay.html',
    styleUrl: './chat-overlay.css',
})
export class ChatOverlay {
    public logedInUser: PrivateWebviewUser | null = null;
    constructor(public navigation: NavigationService, private ebc: ExtensionBackendCommunication, private cdr: ChangeDetectorRef) {

    }
    ngOnInit() {
        this.ebc.user.getLogedInUser().then(user => {
            this.logedInUser = user.user
            this.cdr.detectChanges();
        });
    }

    copyUUID() {
        navigator.clipboard.writeText(`${this.logedInUser?.id}`);
        this.ebc.userFeedback.uuidCopied();
    }

    update() {
        this.ebc.update.update()
    }
}
