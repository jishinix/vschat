import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import AdmZip from 'adm-zip';

// __dirname-Ersatz für ES-Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isServerMode = process.argv.includes('--server');

async function release() {
    try {
        if (isServerMode) {
            console.log('--- Starte: Pull github...');
            execSync('git pull', { stdio: 'inherit' });
        }
        console.log('--- Starte: npm run build...');
        execSync('npm run build', { stdio: 'inherit' });


        const jsonPath = path.join(__dirname, 'release', 'versions.json');
        const versions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
        const latestVersion = versions.latestVersion.split('.');
        latestVersion[2] = Number(latestVersion[2]) + 1;
        const newVersion = latestVersion.join('.');

        console.log('--- Starte: ./build...');
        createExtensionBundle(newVersion)


        const sourceFile = path.join(__dirname, 'out/vschat-local.vsix');
        const relPath = path.join('versions', `vschat-${newVersion}.vsix`)
        const targetFile = path.join(__dirname, 'release', relPath);


        versions.latestVersion = newVersion;
        versions.versions[newVersion] = relPath;
        fs.writeFileSync(jsonPath, JSON.stringify(versions, null, 2));

        console.log('--- Kopiere VSIX in den Release-Ordner...');
        fs.copyFileSync(sourceFile, targetFile);


        if (isServerMode) {
            console.log('--- Starte: restart server...');
            execSync('pm2 restart vschatServer', { stdio: 'inherit' });
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
                pkg.config.authDomain = 'https://jinx-rp.site';
                pkg.config.wsDomain = 'https://jinx-rp.site:42161';
            }

            pkg.activationEvents = pkg.activationEvents.map(event =>
                event === 'onView:vschat-sidebar-dev' ? 'onView:vschat-sidebar' : event
            );
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

release();