import * as fs from 'fs';
import * as Path from 'path';
import { Entry } from './entry';
import * as _ from 'lodash';
import { inject } from '@iamthes/inject';
const FileSystem = fs;

const checkExtensions = ['', '.ts', '.d.ts', '.js', '.tsx', '.jsx'];

export function findFile(name, dirname = '.'): Promise<string> {
    let file: string = null;
    for (let i = 0; i < checkExtensions.length; i++) {
        let extFile = name + checkExtensions[i];
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
    return Promise.resolve(file);
}

export function uniqEntryList(entryListCollection) {
    return _.chain(entryListCollection)
        .flatten<Entry>()
        .uniqBy(entry => entry.hash())
        .value();
}

export function fileList(basedir: string, File = inject('fs', () => fs)): Promise<string[]> {
    let result: string[] = [];
    return new Promise<string[]>(resolve => {
        File.readdir(basedir, (err, files) => {
            // Ignore all errors.
            if (!(files && files.length > 0)) {
                return resolve([]);
            }
            const promises = [];
            files.forEach(file => {
                if (file === '.' || file === '..') return;
                const testPath = Path.join(basedir, file);
                File.stat(testPath, (err, stat) => {
                    if (err) return;
                    if (stat.isDirectory()) {
                        let p = fileList(testPath).then(r => result = result.concat(r));
                        promises.push(p);
                    } else {
                        result.push(testPath);
                    }
                });
            });
            const done = () => resolve(result);
            Promise.all(promises)
                .then(done)
                .catch(done);
        });
    });
}