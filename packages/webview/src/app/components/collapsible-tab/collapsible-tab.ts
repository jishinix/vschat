import { booleanAttribute, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-collapsible-tab',
	imports: [],
	templateUrl: './collapsible-tab.html',
	styleUrl: './collapsible-tab.css',
})
export class CollapsibleTab {
	@Input() public header: string = '';
	@Input({ transform: booleanAttribute }) public arrowOnly: boolean = false;
	@Input({ transform: booleanAttribute }) public active: boolean = false;

	@Output() clickText = new EventEmitter<void>();
}
