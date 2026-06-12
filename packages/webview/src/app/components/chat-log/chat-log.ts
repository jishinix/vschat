import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ChatMessageComponent } from '../chat-message/chat-message';
import { Message } from '@vschat/shared/interfaces/Messages';
import { UserReference } from '@vschat/shared/interfaces/User';

@Component({
  selector: 'app-chat-log',
  standalone: true,
  imports: [ChatMessageComponent],
  templateUrl: './chat-log.html',
  styleUrls: ['./chat-log.css']
})
export class ChatLogComponent {
  public activeChatMessages: Message[] = [
    {
      id: '1',
      chatId: '',
      sender: { username: 'Jishinix' } as UserReference,
      timestamp: 1,
      encryptedContent: '',
      content: `Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et  `,
    },
    {
      id: '2',
      chatId: '',
      sender: { username: 'Thobi Maguire' } as UserReference,
      timestamp: 1,
      encryptedContent: '',
      content: `
        Hallo, das der erste test
        asd asdasd
        asd
        asddxadasd
        asd
        Funktioniert soweit alles?
        `,
    }
  ];
}