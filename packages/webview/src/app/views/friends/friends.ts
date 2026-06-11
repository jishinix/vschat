import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UnobtrusiveInput } from '../../components/unobtrusive-input/unobtrusive-input';
import { ChatOverlay } from '../../components/chat-overlay/chat-overlay';
import { ExtensionBackendCommunication } from '../../services/ExtensionApi/ExtensionBackendCommunication';
import { UserReference } from '@vschat/shared/interfaces/User';
import { CollapsibleTab } from '../../components/collapsible-tab/collapsible-tab';
import { AccountStorage } from '../../services/AccountStorage';

@Component({
    selector: 'app-friends',
    imports: [
        FormsModule,
        UnobtrusiveInput,
        ChatOverlay,
        CollapsibleTab
    ],
    templateUrl: './friends.html',
    styleUrl: './friends.css',
})
export class Friends {
    public uuid: string = '';
    constructor(private ebc: ExtensionBackendCommunication, public accountStorage: AccountStorage) { }

    ngOnInit() {
    }

    sendFriendRequest() {
        this.ebc.user.sendFriendRequest(this.uuid);
    }

    acceptFriendRequest(userId: string) {
        this.ebc.user.sendFriendRequest(userId);
    }

    ignoreFriendRequest(userId: string) {
        this.ebc.user.ignoreFriendRequest(userId);
    }
}
