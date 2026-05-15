import { authApi } from "./ExtensionApi/AuthApi.js"

export const views = {
    login: (app: HTMLElement) => {
        app.innerHTML = `
            <div class="login">
                <h2>Login</h2>
                <label class="inputWrapper">
                    <input type="text" name="text" class="input" required="" id="username" placeholder="Username">
                </label>
                <label class="inputWrapper">
                    <input type="password" name="text" class="input" required="" id="password" placeholder="Passwort">
                </label>
                <button class="loginButton" id="loginBtn">Einloggen</button>
                <span class="footnote">Noch keinen Account? dann <span class="link" id="registerlink">Registrieren</span></span>
            </div>
        `
        setTimeout(() => {
            document.getElementById('registerlink')?.addEventListener('click', () => {
                views.register(app)
            })
            document.getElementById('loginBtn')?.addEventListener('click', () => {
                const un = document.getElementById('username') as HTMLInputElement;
                const pw = document.getElementById('password') as HTMLInputElement;
                if (un && un.value && pw && pw.value)
                    authApi.login(un.value, pw.value);
            })
        }, 1)
    },
    register: (app: HTMLElement) => {
        app.innerHTML = `
            <div class="login">
                <h2>Registrieren</h2>
                <label class="inputWrapper">
                    <input type="text" name="text" class="input" required="" id="username" placeholder="Username">
                </label>
                <label class="inputWrapper">
                    <input type="password" name="text" class="input" required="" id="password" placeholder="Passwort">
                </label>
                <button class="loginButton" id="registerBtn">Einloggen</button>
                <span class="footnote">Schon einen Account? dann <span class="link" id="loginlink">Einloggen</span></span>
            </div>
        `
        setTimeout(() => {
            document.getElementById('loginlink')?.addEventListener('click', () => {
                views.login(app)
            })
            document.getElementById('registerBtn')?.addEventListener('click', () => {
                const un = document.getElementById('username') as HTMLInputElement;
                const pw = document.getElementById('password') as HTMLInputElement;
                if (un && un.value && pw && pw.value)
                    authApi.register(un.value, pw.value);
            })
        }, 1)
    }
}