import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UnobtrusiveInput } from '../../components/unobtrusive-input/unobtrusive-input';
import { ChatOverlay } from '../../components/chat-overlay/chat-overlay';
import { ExtensionBackendCommunication } from '../../services/ExtensionApi/ExtensionBackendCommunication';

@Component({
  selector: 'app-friends',
  imports: [
    FormsModule,
    UnobtrusiveInput,
    ChatOverlay,
  ],
  templateUrl: './friends.html',
  styleUrl: './friends.css',
})
export class Friends {
  public uuid: string = '';
  constructor(private ebc: ExtensionBackendCommunication) { }

  sendFriendRequest() {
    this.ebc.user.sendFriendRequest(this.uuid);
  }
}
