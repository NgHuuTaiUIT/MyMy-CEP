import { os, path, fs } from "../lib/cep/node";
import initJson from '../assets/init.config.json';
import { evalTS } from "../lib/utils/bolt";

export async function createDefaultFileAndFolder() {
    // Get the path to the Documents folder
    const documentsPath = path.join(os.homedir(), 'Documents', 'Adobe', 'MyMy');
    // Define the new folder name
    const importFolderPath = path.join(documentsPath, 'Import');
    const exportFolderPath = path.join(documentsPath, 'Export');
    const initPath = path.join(documentsPath, 'init.config.json');

    // Create the new folder

    if (!fs.existsSync(importFolderPath)) {
        await fs.mkdirSync(importFolderPath, { recursive: true });
    }
    if (!fs.existsSync(exportFolderPath)) {
        await fs.mkdirSync(exportFolderPath, { recursive: true });
    }

    let newConfig = { ...initJson };

    newConfig.import.defaultPath = decodeURI(importFolderPath)
    newConfig.export.defaultPath = decodeURI(exportFolderPath)
    if (!fs.existsSync(initPath)) {
        await fs.writeFileSync(initPath, JSON.stringify(newConfig), 'utf-8');
    }
    return newConfig
}

export async function downloadFile(folderPath: string, url: string, outputPath: string, callback?: () => void): Promise<any> {
    try {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'no-cors',
            headers: {
                'accept': 'application/octet-stream',
            }
        });
        const blob = await response.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());

        const outPath = folderPath + '/' + outputPath
        await fs.writeFileSync(outPath, buffer);
        const isExisted = await fs.existsSync(outPath);
        if (!isExisted) {
            throw new Error('File not found');
        }
        const result = await evalTS("importFileToPremiere", outPath);
        return result;
    }
    catch (error) {
        alert(error);
    }
}

export async function changeFileConfig(configData: string, outPath?: string) {
    const outConfig = outPath || path.join(os.homedir(), 'Documents', 'Adobe', 'MyMy', 'init.config.json');
    await fs.writeFileSync(outConfig, configData, 'utf8')
}