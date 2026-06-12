import { Component } from '@angular/core';
import { ChatLogComponent } from '../../components/chat-log/chat-log';
import { ChatOverlay } from '../../components/chat-overlay/chat-overlay';

@Component({
    selector: 'app-chat',
    imports: [ChatLogComponent, ChatOverlay],
    templateUrl: './chat.html',
    styleUrl: './chat.css',
})
export class Chat {
}
