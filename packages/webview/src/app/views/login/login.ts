import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms'; // UNBEDINGT ERFORDERLICH für [(ngModel)]
import { AuthApi } from '../../services/ExtensionApi/AuthApi'
import { UnobtrusiveInput } from '../../components/unobtrusive-input/unobtrusive-input';
import { AuthActionRtnCodes, AuthActionRtnCodesMessageMap } from '@vschat/shared/interfaces/ApiInterfaces'

@Component({
	selector: 'app-login',
	imports: [
		FormsModule,
		UnobtrusiveInput
	],
	templateUrl: './login.html',
	styleUrl: './login.css',
})
export class Login {
	public username: string = '';
	public password: string = '';

	public errorMessage: string = '';

	@Output() loginSuccess = new EventEmitter<void>();
	@Output() registerPage = new EventEmitter<void>();

	constructor(private authApi: AuthApi, private cdr: ChangeDetectorRef) { }

	public async onLoginSubmit(): Promise<void> {
		this.errorMessage = '';

		if (!this.username.trim() || !this.password.trim()) {
			this.errorMessage = 'Bitte fülle alle Felder aus.';
			return;
		}

		const loginResult = await this.authApi.login(this.username, this.password);
		if (loginResult.code !== AuthActionRtnCodes.success) {
			this.errorMessage = AuthActionRtnCodesMessageMap[loginResult.code];
			this.cdr.detectChanges();
		} else {
			this.loginSuccess.emit();
		}
	}
}
