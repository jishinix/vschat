import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-box',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chat-box.html',
  styleUrl: './chat-box.css',
})
export class ChatBox implements AfterViewInit {
  @Input() value: string = '';
  @Input() placeholder: string = 'Nachricht (Markdown erlaubt)...';

  @Output() valueChange = new EventEmitter<string>();
  @Output() enterPressed = new EventEmitter<string>();

  @ViewChild('textareaRef') textareaRef!: ElementRef<HTMLTextAreaElement>;

  ngAfterViewInit() {
    this.adjustHeight();
  }

  onInputChange(newValue: string) {
    this.value = newValue;
    this.valueChange.emit(this.value);
    this.adjustHeight();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.value.trim().length > 0) {
        this.enterPressed.emit(this.value);
      }
    }
  }

  private adjustHeight() {
    if (!this.textareaRef) return;
    const textarea = this.textareaRef.nativeElement;

    // Höhe zurücksetzen, um Verkleinerung bei Textlöschung zu erlauben
    textarea.style.height = 'auto';
    // Neue Höhe basierend auf dem Inhalt setzen
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
}