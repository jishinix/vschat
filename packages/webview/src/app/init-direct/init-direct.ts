import { ChangeDetectorRef, Component } from '@angular/core';
import { ExtensionBackendCommunication } from '../services/ExtensionApi/ExtensionBackendCommunication';
import { NavigationService } from '../services/NavigationService';

@Component({
    selector: 'app-init-direct',
    imports: [],
    templateUrl: './init-direct.html',
    styleUrl: './init-direct.css',
})
export class InitDirect {
    constructor(private ebc: ExtensionBackendCommunication, public navigation: NavigationService) {
        ebc.auth.getLoginState().then((data) => {
            if (data.status) navigation.switchView('chatlist')
            else navigation.switchView('login')
        })
    }
}
