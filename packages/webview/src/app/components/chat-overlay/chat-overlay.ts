import { Component, EventEmitter, Output } from '@angular/core';
import { NavigationService } from '../../services/NavigationService';

@Component({
    selector: 'app-chat-overlay',
    imports: [],
    templateUrl: './chat-overlay.html',
    styleUrl: './chat-overlay.css',
})
export class ChatOverlay {
    constructor(public navigation: NavigationService) { }
}
