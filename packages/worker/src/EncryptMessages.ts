import { parentPort } from 'worker_threads';
import { DecrypredMessageData, MessageData } from '@vschat/shared/interfaces/Messages'
import { CryptoService } from '@vschat/shared/Utils/CryptoService'
import { EncryptedContent } from '@vschat/shared/interfaces/EncryptedContent';

// Sicherstellen, dass wir wirklich im Worker-Kontext sind
if (!parentPort) {
    throw new Error('Dieser Worker muss als Worker-Thread gestartet werden!');
}


// Nachricht vom Haupt-Thread empfangen
parentPort.on('message', (data: { messages: EncryptedContent[], userId: string, privateKey: string }) => {
    parentPort!.postMessage(CryptoService.encryptMultibleContent(data.messages, data.privateKey, data.userId));
});