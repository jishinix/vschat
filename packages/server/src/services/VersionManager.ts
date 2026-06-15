import path from 'path';
import fs from 'fs';

interface versionsJson {
    versions: Record<string, string>,
    latestVersion: string
}

export class VersionManager {
    private static versionDirPath = process.env.VERSION_DIR_PATH as string;

    private static loadJson() {
        const versionJson = path.join(this.versionDirPath, 'versions.json');
        const json = JSON.parse(fs.readFileSync(versionJson, 'utf8')) as versionsJson;
        return json
    }

    static getVersion() {
        return this.loadJson().latestVersion;
    }

    static getData() {
        const json = this.loadJson();

        const relPath = json.versions[json.latestVersion];
        console.log(relPath)
        const data = fs.readFileSync(path.join(this.versionDirPath, relPath));
        console.log(data);
        return data as Buffer<ArrayBuffer>;
    }
}