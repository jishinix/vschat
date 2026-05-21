import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms'; // UNBEDINGT ERFORDERLICH für [(ngModel)]
import { ExtensionBackendCommunication } from '../../services/ExtensionApi/ExtensionBackendCommunication'
import { UnobtrusiveInput } from '../../components/unobtrusive-input/unobtrusive-input';
import { AuthActionRtnCodes, AuthActionRtnCodesMessageMap } from '@vschat/shared/interfaces/ApiInterfaces'
import { CollapsibleTab } from '../../components/collapsible-tab/collapsible-tab';
import { NavigationService } from '../../services/NavigationService';

@Component({
	selector: 'app-login',
	imports: [
		FormsModule,
		UnobtrusiveInput,
		CollapsibleTab
	],
	templateUrl: './login.html',
	styleUrl: './login.css',
})
export class Login {
	public username: string = '';
	public password: string = '';

	public errorMessage: string = '';

	constructor(private ebc: ExtensionBackendCommunication, private cdr: ChangeDetectorRef, public navigation: NavigationService) { }

	public async onLoginSubmit(): Promise<void> {
		this.errorMessage = '';

		if (!this.username.trim() || !this.password.trim()) {
			this.errorMessage = 'Bitte fülle alle Felder aus.';
			return;
		}

		const loginResult = await this.ebc.auth.login(this.username, this.password);
		if (loginResult.code !== AuthActionRtnCodes.success) {
			this.errorMessage = AuthActionRtnCodesMessageMap[loginResult.code];
			this.cdr.detectChanges();
		} else {
			this.navigation.switchView('chatlist')
		}
	}
}
