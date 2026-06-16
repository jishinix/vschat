import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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

        console.log('--- Starte: ./build.sh...');
        execSync('./build.sh', { stdio: 'inherit' });

        const jsonPath = 'release/versions.json';
        const versions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
        const latestVersion = versions.latestVersion.split('.');
        latestVersion[2] = Number(latestVersion[2]) + 1;
        const newVersion = latestVersion.join('.');

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

release();