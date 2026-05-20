import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UnobtrusiveInput } from '../../components/unobtrusive-input/unobtrusive-input';
import { AuthApi } from '../../services/ExtensionApi/AuthApi';
import { AuthActionRtnCodes, AuthActionRtnCodesMessageMap } from '@vschat/shared/interfaces/ApiInterfaces';
import { ViewSwitchMessage } from '../../app';

@Component({
    selector: 'app-register',
    imports: [
        FormsModule,
        UnobtrusiveInput,
    ],
    templateUrl: './register.html',
    styleUrl: './register.css',
})
export class Register {
    public username: string = '';
    public password: string = '';
    public passwordConfirm: string = '';

    public errorMessage: string = '';

    @Output() registerSuccess = new EventEmitter<void>();
    @Output() loginPage = new EventEmitter<void | ViewSwitchMessage>();

    constructor(private authApi: AuthApi, private cdr: ChangeDetectorRef) { }

    public async onRegisterSubmit(): Promise<void> {
        this.errorMessage = '';

        const username = this.username.trim();
        const password = this.password.trim();
        const passwordConfirm = this.passwordConfirm.trim();

        if (!username || !password || !passwordConfirm) {
            this.errorMessage = 'Bitte fülle alle Felder aus.';
            return;
        }

        if (password !== passwordConfirm) {
            this.errorMessage = 'Passwörter stimmen nicht überein';
            return;
        }

        const registerResult = await this.authApi.register(username, password);
        if (registerResult.code !== AuthActionRtnCodes.success) {
            this.errorMessage = AuthActionRtnCodesMessageMap[registerResult.code];
        } else {
            const loginResult = await this.authApi.login(username, password);
            if (loginResult.code !== AuthActionRtnCodes.success) {
                this.loginPage.emit({ succsess: "Account wurde erfolgreich erstellt." });
            } else {
                this.registerSuccess.emit();
            }
        }
        this.cdr.detectChanges();
    }
}