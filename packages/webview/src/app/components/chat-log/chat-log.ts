import { Component, Input, Output, EventEmitter, signal, SimpleChanges, ElementRef, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ChatMessageComponent } from '../chat-message/chat-message';
import { DecrypredMessageData } from '@vschat/shared/interfaces/Messages';
import { UserReference } from '@vschat/shared/interfaces/User';
import { ChatData } from '@vschat/shared/interfaces/Chat';
import { ExtensionBackendCommunication } from '../../services/ExtensionApi/ExtensionBackendCommunication';
import { NavigationService } from '../../services/NavigationService';

@Component({
    selector: 'app-chat-log',
    standalone: true,
    imports: [ChatMessageComponent],
    templateUrl: './chat-log.html',
    styleUrls: ['./chat-log.css']
})
export class ChatLogComponent implements AfterViewInit, OnDestroy {
    @Input() chat?: ChatData<UserReference> | null;

    // Neues Event, das gefeuert wird, wenn der erste Fetch durch ist
    @Output() initFetchComplete = new EventEmitter<DecrypredMessageData[]>();

    @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
    @ViewChild('topAnchor') topAnchor!: ElementRef<HTMLDivElement>;

    public activeChatMessages = signal<DecrypredMessageData[]>([]);

    private observer?: IntersectionObserver;
    public isLoading = false;
    public hasMoreOlderMessages = signal<boolean>(true);
    private readonly BATCH_SIZE = 100;
    private isInitialLoad = true;

    constructor(
        private ebc: ExtensionBackendCommunication,
        private cdr: ChangeDetectorRef,
        private navigation: NavigationService
    ) {
    }

    ngOnInit() {
        this.navigation.extradata.addMsg = (msg: DecrypredMessageData) => {
            if (msg.chatId === this.chat?.id) {
                this.activeChatMessages.set([...this.activeChatMessages(), msg]);
                setTimeout(() => {
                    this.scrollToBottom();
                }, 10)
            }
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['chat'] && this.chat) {
            this.activeChatMessages.set([]);
            this.hasMoreOlderMessages.set(true);
            this.isInitialLoad = true;
            this.loadInitialMessages();
        }
    }

    ngAfterViewInit() {
        this.setupIntersectionObserver();
    }

    ngOnDestroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    private loadInitialMessages() {
        if (!this.chat) return;

        this.isLoading = true;
        this.ebc.chat.fetchMessages(this.chat.id, this.BATCH_SIZE, null).then(e => {
            this.activeChatMessages.set(e.messages);
            this.isLoading = false;

            this.cdr.detectChanges();
            this.scrollToBottom();

            // Event feuern und die geladenen Nachrichten mitsenden
            this.initFetchComplete.emit(e.messages);

            setTimeout(() => {
                this.isInitialLoad = false;
            }, 200);
        }).catch((err) => {
            this.isLoading = false;
            console.error('Initial fetch failed:', err);
        });
    }

    private setupIntersectionObserver() {
        const options = {
            root: this.scrollContainer ? this.scrollContainer.nativeElement : null,
            rootMargin: '50px 0px 0px 0px',
            threshold: 0
        };

        this.observer = new IntersectionObserver((entries) => {
            console.log('observed');
            const entry = entries[0];

            if (entry.isIntersecting && !this.isLoading && this.chat && this.hasMoreOlderMessages() && !this.isInitialLoad) {
                this.fetchOlderMessages();
            }
        }, options);

        if (this.topAnchor) {
            this.observer.observe(this.topAnchor.nativeElement);
        }
    }

    private fetchOlderMessages() {
        const messages = this.activeChatMessages();
        if (messages.length === 0) return;

        this.isLoading = true;
        this.cdr.detectChanges();

        const container = this.scrollContainer.nativeElement;
        const previousScrollHeight = container.scrollHeight;
        const previousScrollTop = container.scrollTop;

        const oldestMessageId = messages[0].id;

        this.ebc.chat.fetchMessages(this.chat!.id, this.BATCH_SIZE, oldestMessageId).then(e => {
            if (!e.messages || e.messages.length === 0) {
                this.hasMoreOlderMessages.set(false);
            } else {
                this.activeChatMessages.set([...e.messages, ...messages]);

                this.cdr.detectChanges();

                const newScrollHeight = container.scrollHeight;
                container.scrollTop = previousScrollTop + (newScrollHeight - previousScrollHeight);
            }
            this.isLoading = false;
        }).catch((err) => {
            console.error(err);
            this.isLoading = false;
        });
    }

    private scrollToBottom() {
        if (this.scrollContainer) {
            const container = this.scrollContainer.nativeElement;
            container.scrollTop = container.scrollHeight;
        }
    }
}