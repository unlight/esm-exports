import * as Path from "path";
import { parseFile } from "./parse-file";
import { flatten, endsWith, startsWith } from "lodash";
import { Entry } from "./entry";
const recursive = require("recursive-readdir");
const unixify = require("unixify");

export function directory(target: string): Promise<Entry[]> {
    if (typeof target !== 'string') {
        return Promise.reject('Target must be a string');
    }
    var targetNodeModules = Path.normalize(Path.join(target, 'node_modules'));
    return new Promise<any[]>((resolve, reject) => {
        var files: string[] = recursive(target, [ignore.bind(null, targetNodeModules)], (err, files) => {
            if (err) return reject(err);
            resolve(files);
        });
    }).then(files => {
        return Promise.all(
            files.map(file => {
                file = Path.resolve(file);
                return parseFile(file, { dirname: target });
            }))
            .then(result => {
                return flatten<any>(result);
            });
    })
}

function ignore(targetNodeModules, file, stats) {
    if (startsWith(file, targetNodeModules)) return true;
    if (stats.isDirectory()) return false;
    if (endsWith(Path.extname(file), ".ts")) return false;
    return true;
}