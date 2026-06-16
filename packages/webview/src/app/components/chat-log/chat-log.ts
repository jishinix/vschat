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
    @ViewChild('bottomAnchor') bottomAnchor!: ElementRef<HTMLDivElement>;

    public activeChatMessages = signal<DecrypredMessageData[]>([]);

    private topObserver?: IntersectionObserver;
    private bottomObserver?: IntersectionObserver;
    public isLoading = false;
    public hasMoreOlderMessages = signal<boolean>(true);
    private readonly BATCH_SIZE = 100;
    private isInitialLoad = true;
    private isAutoScrolling = false;

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

                this.isAutoScrolling = true;
                setTimeout(() => {
                    this.scrollToBottom();
                    setTimeout(() => this.isAutoScrolling = false, 100);
                }, 10);
            }
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['chat'] && this.chat) {
            this.activeChatMessages.set([]);
            this.hasMoreOlderMessages.set(true);
            this.isInitialLoad = true;
            this.isAutoScrolling = false;
            this.loadInitialMessages();
        }
    }

    ngAfterViewInit() {
        this.setupIntersectionObservers();
    }

    ngOnDestroy() {
        if (this.topObserver) this.topObserver.disconnect();
        if (this.bottomObserver) this.bottomObserver.disconnect();
    }

    private loadInitialMessages() {
        if (!this.chat) return;

        this.isLoading = true;
        this.ebc.chat.fetchMessages(this.chat.id, this.BATCH_SIZE, null).then(e => {
            this.activeChatMessages.set(e.messages);
            this.isLoading = false;

            this.cdr.detectChanges();

            this.isAutoScrolling = true;

            this.scrollToBottom();

            // Event feuern und die geladenen Nachrichten mitsenden
            this.initFetchComplete.emit(e.messages);
            setTimeout(() => {
                this.isInitialLoad = false;
                this.isAutoScrolling = false;
            }, 300);

            setTimeout(() => {
                this.isInitialLoad = false;
            }, 200);
        }).catch((err) => {
            this.isLoading = false;
            console.error('Initial fetch failed:', err);
        });
    }

    private setupIntersectionObservers() {
        const rootContainer = this.scrollContainer ? this.scrollContainer.nativeElement : null;

        // --- OBSERVER FÜR OBEN (Nachladen) ---
        const topOptions = { root: rootContainer, rootMargin: '50px 0px 0px 0px', threshold: 0 };
        this.topObserver = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && !this.isLoading && this.chat && this.hasMoreOlderMessages() && !this.isInitialLoad) {
                this.fetchOlderMessages();
            }
        }, topOptions);

        if (this.topAnchor) {
            this.topObserver.observe(this.topAnchor.nativeElement);
        }

        // --- NEU: OBSERVER FÜR UNTEN (Als gelesen markieren) ---
        // rootMargin '0px 0px 10px 0px' triggert, sobald das Ende fast exakt erreicht ist
        const bottomOptions = { root: rootContainer, rootMargin: '0px 0px 10px 0px', threshold: 1.0 };
        this.bottomObserver = new IntersectionObserver((entries) => {
            const entry = entries[0];

            // Nur feuern, wenn sichtbar AND nicht im InitialLoad AND nicht im automatischen Nachrichtenscrollen
            if (entry.isIntersecting && !this.isInitialLoad && !this.isAutoScrolling && this.chat) {
                this.markChatAsRead();
            }
        }, bottomOptions);

        if (this.bottomAnchor) {
            this.bottomObserver.observe(this.bottomAnchor.nativeElement);
        }
    }

    private markChatAsRead() {
        if (!this.chat) return;
        console.log(`🤖 Chat ${this.chat.id} wurde manuell ganz nach unten gescrollt -> Als gelesen markieren!`);
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