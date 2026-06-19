import { ChangeDetectorRef, Component, ElementRef, signal, ViewChild } from '@angular/core';
import { ChatLogComponent } from '../../components/chat-log/chat-log';
import { ChatOverlay } from '../../components/chat-overlay/chat-overlay';
import { ExtensionBackendCommunication } from '../../services/ExtensionApi/ExtensionBackendCommunication';
import { NavigationService } from '../../services/NavigationService';
import { ChatData } from '@vschat/shared/interfaces/Chat';
import { UserReference } from '@vschat/shared/interfaces/User';
import { ChatBox } from '../../components/chat-box/chat-box';
import { RawAttachment } from '@vschat/shared/interfaces/Messages';

@Component({
    selector: 'app-chat',
    imports: [ChatLogComponent, ChatOverlay, ChatBox],
    templateUrl: './chat.html',
    styleUrl: './chat.css',
})
export class Chat {
    public message: string = '';
    public chat = signal<ChatData<UserReference> | null>(null);
    @ViewChild('chatWrapper') chatWrapper!: ElementRef<HTMLDivElement>;
    constructor(private cdr: ChangeDetectorRef, private ebc: ExtensionBackendCommunication, public navigation: NavigationService) {
    }

    sendMsg() {
        const chat = this.chat()
        if (chat == null) return;
        this.ebc.chat.sendMsg({
            content: this.message,
            chatId: chat.id,
            attachments: [
                {
                    mineType: "txt/text",
                    data: "tets",
                    fileName: 'testFile.txt'
                }
            ]
        })
        this.message = '';
    }

    ngOnInit() {
        this.ebc.chat.getChat(this.navigation.navigationData.chatId()).then(e => {
            this.chat.set(e);
        })
    }

    handleInitFetch(messages: any[]) {
        this.cdr.detectChanges();

        if (this.chatWrapper) {
            const container = this.chatWrapper.nativeElement;
            container.scroll({ top: container.scrollHeight })
            //container.scrollTop = container.scrollHeight;
        }
    }
}
