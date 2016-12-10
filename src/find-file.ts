import * as fs from "fs";
import * as Path from "path";

const checkExtensions = ["", ".ts", ".d.ts"];

export function findFile(name, dirname = ".") {
    let file = null;
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
    return file;
}