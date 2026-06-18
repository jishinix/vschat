import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import AdmZip from 'adm-zip';

// __dirname-Ersatz für ES-Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const isServerMode = process.argv.includes('--server');
const isLiveServerMode = process.argv.includes('--liveserver');
const saveAuth = process.argv.includes('--saveauth');

async function release() {
    try {
        if (isServerMode) {
            console.log('--- Starte: Pull github...');
            //execSync('git pull', { stdio: 'inherit' });
        }


        const releasePath = path.join(__dirname, 'release')
        const releasePresetPath = path.join(__dirname, 'release-preset');
        if(!fs.existsSync(releasePath) && fs.existsSync(releasePresetPath)){
            fs.cpSync(releasePresetPath, releasePath, { recursive: true })
            fs.mkdirSync(path.join(releasePath, 'versions'))
        }

        const jsonPath = path.join(__dirname, 'release', 'versions.json');
        const versions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
        const latestVersion = versions.latestVersion.split('.');
        latestVersion[2] = Number(latestVersion[2]) + 1;
        const newVersion = latestVersion.join('.');


        
        const sourceFile = path.join(__dirname, 'out/vschat-local.vsix');
        const relPath = path.join('versions', `vschat-${newVersion}.vsix`)
        const targetFile = path.join(releasePath, relPath);

        console.log('--- Starte: ./build...');
        createExtensionBundle(newVersion)




        versions.latestVersion = newVersion;
        versions.versions[newVersion] = relPath;
        fs.writeFileSync(jsonPath, JSON.stringify(versions, null, 2));

        console.log('--- Kopiere VSIX in den Release-Ordner...');
        fs.copyFileSync(sourceFile, targetFile);


        if (isServerMode) {
            console.log('--- Starte: restart server...');
            execSync('docker compose up --build -d', { stdio: 'inherit' });
        }

        console.log('🎉 Release-Prozess erfolgreich abgeschlossen!');

    } catch (error) {
        console.log(error);
        console.error('❌ Fehler während des Release-Prozesses:', error.message);
        process.exit(1);
    }
}

function createExtensionBundle(version) {
    const tempDir = path.join(__dirname, 'temp-bundle');
    const tempExtensionDir = path.join(tempDir, 'extension');
    const outDir = path.join(__dirname, 'out');
    const zipOutputPath = path.join(outDir, 'vschat-local.vsix');

    try {


        console.log('--- Starte: npm run build...');
        execSync('npm run build', { stdio: 'inherit' });

        if (!fs.existsSync(tempExtensionDir)) {
            fs.mkdirSync(tempExtensionDir, { recursive: true });
        }

        const srcExtension = path.join(outDir, 'extension');
        if (fs.existsSync(srcExtension)) {
            fs.cpSync(srcExtension, tempExtensionDir, { recursive: true });
        } else {
            throw new Error(`Source-Verzeichnis nicht gefunden: ${srcExtension}`);
        }

        const srcPackageJson = path.join(__dirname, 'extension-package.json');
        const pkg = JSON.parse(fs.readFileSync(srcPackageJson, 'utf8'));

        pkg.version = version;

        if (isServerMode) {
            pkg.name = 'vschat';
            pkg.displayName = 'Visual Studio Chat';
            if (pkg.contributes) {
                if (pkg.contributes.viewsContainers?.activitybar) {
                    pkg.contributes.viewsContainers.activitybar.forEach(container => {
                        if (container.id === 'vschat-sidebar-container-dev') {
                            container.id = 'vschat-sidebar-container';
                            container.title = 'Visual Studio Chat';
                            container.icon = 'resources/chat-icon.svg'
                        }
                    });
                }

                if (pkg.contributes.views && pkg.contributes.views['vschat-sidebar-container-dev']) {
                    pkg.contributes.views['vschat-sidebar-container'] = pkg.contributes.views['vschat-sidebar-container-dev'].map(view => {
                        if (view.id === 'vschat-sidebar-dev') {
                            view.id = 'vschat-sidebar';
                            view.name = 'Chat';
                            view.icon = 'resources/chat-icon.svg';
                        }
                        return view;
                    });
                    delete pkg.contributes.views['vschat-sidebar-container-dev'];
                }
            }


            if (pkg.config) {
                pkg.config.isDev = false;
            }


            pkg.activationEvents = pkg.activationEvents.map(event =>
                event === 'onView:vschat-sidebar-dev' ? 'onView:vschat-sidebar' : event
            );
        }

        if (isServerMode || isLiveServerMode) {
            if (pkg.config) {
                console.log('domain wird auf live server umgestellt');
                pkg.config.authDomain = 'https://jinx-rp.site';
                pkg.config.wsDomain = 'https://jinx-rp.site:42161';
            }
        }
        if (isServerMode || saveAuth) {
            if (pkg.config) {
                console.log('login wird gespeichert');
                pkg.config.saveAuth = true
            }
        }

        const destPackageJson = path.join(tempExtensionDir, 'package.json');
        fs.writeFileSync(destPackageJson, JSON.stringify(pkg, null, 2));

        const zip = new AdmZip();
        zip.addLocalFolder(tempDir);

        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }
        zip.writeZip(zipOutputPath);
        console.log(`Zip erfolgreich erstellt unter: ${zipOutputPath}`);

    } catch (error) {
        console.error('Fehler während des Ablaufs:', error);
    } finally {
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
            console.log('Temp-Ordner erfolgreich aufgeräumt.');
        }
    }
}

function start() {
    if (isServerMode) {
        release();
    } else {
        createExtensionBundle('1.0.0');
    }
}


start();