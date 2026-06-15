import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// __dirname-Ersatz für ES-Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function release() {
    try {
        // 1. npm run build
        console.log('--- Starte: npm run build...');
        // stdio: 'inherit' sorgt dafür, dass du den Output des Builds direkt im Terminal siehst
        execSync('npm run build', { stdio: 'inherit' });

        // 2. ./build.sh
        console.log('--- Starte: ./build.sh...');
        execSync('./build.sh', { stdio: 'inherit' });

        const jsonPath = 'release/versions.json';
        const versions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
        const latestVersion = versions.latestVersion.split('.');
        latestVersion[2] = Number(latestVersion[2]) + 1;
        const newVersion = latestVersion.join('.');

        // Pfade für das Kopieren definieren
        const sourceFile = path.join(__dirname, 'out/vschat-local.vsix');
        const relPath = path.join('versions', `vschat-${newVersion}.vsix`)
        const targetFile = path.join(__dirname, 'release', relPath);


        versions.latestVersion = newVersion;
        versions.versions[newVersion] = relPath;
        fs.writeFileSync(jsonPath, JSON.stringify(versions, null, 2));

        // 3. cp -R out/vschat-local.vsix release/versions/vschat-local.vsix
        console.log('--- Kopiere VSIX in den Release-Ordner...');
        await fs.copyFileSync(sourceFile, targetFile);

        console.log('🎉 Release-Prozess erfolgreich abgeschlossen!');

    } catch (error) {
        console.log(error);
        console.error('❌ Fehler während des Release-Prozesses:', error.message);
        process.exit(1);
    }
}

release();