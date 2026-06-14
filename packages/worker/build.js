const esbuild = require('esbuild');
const path = require('path');

async function runBuild() {
    try {
        await esbuild.build({
            entryPoints: [
                { in: 'src/EncryptMessages.ts', out: 'EncryptMessages' }
            ],
            bundle: true,
            platform: 'node',
            format: 'cjs',
            target: 'node16',
            outdir: '../../out/extension/worker',

            // Zwingt esbuild, deine tsconfig.json für die Pfad-Aliase (@vschat/*) zu lesen
            tsconfig: path.join(__dirname, 'tsconfig.json'),

            // Wir bündeln alles (inklusive deines Shared-Crypto-Codes),
            // schließen aber 'vscode' explizit aus.
            external: ['vscode'],
            packages: 'bundle',

            sourcemap: true,
        });

        console.log('⚡ Worker erfolgreich und fehlerfrei separat gebundelt!');
    } catch (error) {
        console.error('❌ Build fehlgeschlagen:', error.message || error);
        process.exit(1);
    }
}

runBuild();