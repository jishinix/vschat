import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [],
  templateUrl: './chat-message.html',
  styleUrls: ['./chat-message.css']
})
export class ChatMessageComponent implements OnInit {
  @Input() messageData!: any;

  constructor() {
    // Hier ist es IMMER undefined, da Angular die Inputs noch nicht gebunden hat
  }

  ngOnInit() {
    // HIER läuft es perfekt! Die Daten sind da.
    console.log('Message empfangen im Hook:', this.messageData);
  }
}