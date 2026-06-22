import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import AdmZip from 'adm-zip';
import { rmSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function start() {
    const srcFolderPath = path.join(__dirname, '..', 'out', 'extension');
    const tempFolderPath = path.join(__dirname, '..', 'out', 'extension-temp');
    if(fs.existsSync(tempFolderPath)){
        rmSync(tempFolderPath, { 
            recursive: true,
            force: true
        });
    }
    fs.copySync(srcFolderPath, tempFolderPath);
}


start();