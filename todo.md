# Todos

### Auth
- [ ] **Backupcodes überarbeiten**
  Aktuell werden alle samt Masterkey-Hash an den User geschickt. Es sollten nur die Masterkeys an den Nutzer geschickt werden. Der Client sollte einen Backupcode eingeben, alle Backupslots entschlüsseln/hashen und der Server kontrolliert den Hash des Masterkeys. So bekommen unautorisierte Personen keine Backupslots und Proof.

 - [ ] **Passwort vergessen ist noch nicht eingebaut.**
 - [ ] **Save Login**

### Chat
 - [ ] **typpig indikator**
 - [x] **chatList loading sollte in das extensionbackend um gecachde chats zu verwenden statt denn server zu belasten. Lediglich das fetchen der generell verfügbaren chats und, unreadeten messages und last timestamp sollten immer gefetcht werden**
 - [ ] **Life updating verschiedener services:**
    - [ ] friendseite
    - [ ] new chat bzw generell chatList

 - [ ] **Readet confirmation wird noch nicht geschickt:**
    - [ ] **mark chat as readet beim runterscrollen (technik an sich existiert schon)**
    - [ ] system ausdenken wann ein chat >gelesen< wurde
      - Chat zählt als gelesen wenn man manuell nach unten scrollt, oder eine nachricht schickt.

 - [ ] **new message indikator in chat direkt**


### Relationships
 - [ ] **Block user**
 - [ ] **Unfriend User**

### Features
 - [ ] **Code Livestreaming**
 - [ ] **online state**
 - [ ] **Verschlüsselter Medienversand**

### notifications
 - [ ] **new Message**
 - [ ] **new friendrequest**
 - [ ] **Friend request angenommen**

### bugs
 - [ ] **neue freunde wenn man selbst in eine freind request geschickt, haben werden nicht angezeigt nach angenommen (schätzungsweißer localer extension test)**
 - [ ] **neue freunde (bzw keine nachrihcten bis jetzt) create chat funktioniert nicht.**
 - [x] **Log by message input**