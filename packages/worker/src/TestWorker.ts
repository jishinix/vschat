import { parentPort } from 'worker_threads';

// Sicherstellen, dass wir wirklich im Worker-Kontext sind
if (!parentPort) {
    throw new Error('Dieser Worker muss als Worker-Thread gestartet werden!');
}

// Nachricht vom Haupt-Thread empfangen
parentPort.on('message', (data: { zahl1: number; zahl2: number }) => {
    const { zahl1, zahl2 } = data;

    // Berechnung ausführen
    const ergebnis = zahl1 * zahl2;

    // Ergebnis direkt zurückschicken
    parentPort!.postMessage({
        erfolgreich: true,
        ergebnis: ergebnis,
    });
});