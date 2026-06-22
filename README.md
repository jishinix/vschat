# vschat

Eine visuelle und sichere Chat-Plattform, die direkt in VS Code integriert ist. Das Projekt basiert auf einer Monorepo-Struktur und nutzt WebSockets für die Echtzeit-Kommunikation sowie Ende-zu-Ende-Verschlüsselung für maximale Sicherheit.

> ⚠️ **Status:** Dieses Projekt befindet sich aktuell noch in der Entwicklung (**Work in Progress**).

 
## Bekannte Bugs & WIP-Einschränkungen
Da das Projekt noch aktiv entwickelt wird, gibt es aktuell ein bekanntes Problem im Beziehungs-System:
- Nach dem Versenden einer Anfrage kommt diese manchmal nicht sofort an. Gegebenenfalls muss die Friends-Seite manuell neu geladen werden.
- Nach dem Annehmen einer Anfrage müssen der Server und die Extensions potenziell neu gestartet werden. Grund hierfür ist eine fehlerhafte Zwischenspeicherung (Cache) der alten Relationship-Struktur.
- Fix ist in Arbeit!
- weitere bugs in der todo.md

---

## 🛠️ Installation & Setup

Befolge diese Schritte, um das Projekt lokal aufzusetzen:

### 1. Voraussetzungen
Stelle sicher, dass **Docker** installiert ist und läuft, bevor du startest.

### 2. Repository klonen & Dependencies installieren
Öffne dein Terminal und führe folgende Befehle aus:

```bash
# Repository klonen
git clone https://github.com/jishinix/vschat.git

# In das Verzeichnis wechseln
cd vschat

# Dependencies installieren
npm i
```

### 3. Konfiguration anpassen
Nach der Installation müssen einige Konfigurationsdateien und Ordner vorbereitet werden:

- Benenne den Ordner ``release-preset`` in ``release`` um.

- Erstelle innerhalb des neuen ``release``-Ordners einen Unterordner namens ``versions`` (``release/versions``).

- Benenne die Datei ``.env-example`` im Stammverzeichnis in ``.env`` um und passe die Variablen bei Bedarf an.

## Entwicklung & Debugging
Um die Extension lokal zu testen und zu debuggen:
- Öffne das Projekt bzw. den entsprechenden Workspace in VS Code.
- Wechsel in den Debug-Tab (Sidebar).
- Wähle das Launch-Profil ``Launch both extensions`` aus und starte es.

## Production Build (VSIX)
Wenn du die Extension und den Server final bauen möchtest:

Führe das Build-Skript für den Server aus:
```bash
node build.js --server
```


Um die generierte Extension in VS Code zu installieren:
- Öffne den Extensions-Tab in VS Code (Ctrl+Shift+X).
- Klicke oben rechts auf die drei Punkte (...).
- Wähle "Install from VSIX..." aus.
- Navigiere zu ``release/versions/...`` und wähle die entsprechende .vsix-Datei aus.
