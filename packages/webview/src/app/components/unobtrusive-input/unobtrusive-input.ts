import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-unobtrusive-input',
	imports: [
		FormsModule
	],
	templateUrl: './unobtrusive-input.html',
	styleUrl: './unobtrusive-input.css',
})
export class UnobtrusiveInput {
	@Input() value: string = '';
	@Input() placeholder: string = '';
	@Input() type: string = '';

	@Output() valueChange = new EventEmitter<string>();

	onInputChange(newValue: string) {
		this.value = newValue;
		this.valueChange.emit(newValue); // Schickt den neuen Wert an die Elternkomponente
	}

}
