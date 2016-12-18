import * as fs from 'fs';
import * as Path from 'path';

const checkExtensions = ['', '.ts', '.d.ts', '.js'];

export function findFile(name, dirname = '.'): Promise<string> {
    let file: string = null;
    for (let i = 0; i < checkExtensions.length; i++) {
        let extFile = name + checkExtensions[i];
        // console.log('dirname, extFile', dirname, extFile);
        let testFile = Path.resolve(dirname, extFile);
        try {
            var stat = fs.statSync(testFile);
        } catch (e) {
            continue;
        }
        if (stat.isDirectory()) continue;
        file = testFile;
        break;
    }
    return Promise.resolve(file)
}