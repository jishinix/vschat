import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UnobtrusiveInput } from '../../components/unobtrusive-input/unobtrusive-input';
import { AuthApi } from '../../services/ExtensionApi/AuthApi';
import { AuthActionRtnCodes, AuthActionRtnCodesMessageMap } from '@vschat/shared/interfaces/ApiInterfaces';
import { NavigationService } from '../../services/NavigationService';
import { ExtensionBackendCommunication } from '../../services/ExtensionApi/ExtensionBackendCommunication';

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

    constructor(private ebc: ExtensionBackendCommunication, private cdr: ChangeDetectorRef, public navigation: NavigationService) { }

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

        const registerResult = await this.ebc.auth.register(username, password);
        registerResult.data
        if (registerResult.code !== AuthActionRtnCodes.success) {
            this.errorMessage = AuthActionRtnCodesMessageMap[registerResult.code];
        } else {
            const loginResult = await this.ebc.auth.login(username, password);
            if (loginResult.code !== AuthActionRtnCodes.success) {
                this.navigation.switchView('login', { success: "Account wurde erfolgreich erstellt." })
            } else {
                this.navigation.switchView('chatlist',)
            }
        }
        this.cdr.detectChanges();
    }
}