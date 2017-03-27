import * as fs from 'fs';
import * as Path from 'path';
import { Entry } from './entry';
import * as _ from 'lodash';
import { inject } from '@iamthes/inject';

export const findFileExtensions = ['', '.ts', '.d.ts', '.js', '.tsx', '.jsx'];
export const fileExtensions2 = ['.ts', '.js'];
export const fileExtensions3 = ['.tsx', '.jsx'];

export function findFile(name, dirname = '.'): Promise<string> {
    let file: string = null;
    for (let i = 0; i < findFileExtensions.length; i++) {
        let extFile = name + findFileExtensions[i];
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

// TODO: Test case, map iterator returns false for all, and  directories and not watched
export function fileList(basedir: string, mapIterator = (path: string) => path, File = inject('fs', () => fs)): Promise<string[]> {
    let result: string[] = [];
    return new Promise<string[]>(resolve => {
        File.readdir(basedir, (err, files) => {
            // Ignore all errors.
            if (!(files && files.length > 0)) {
                return resolve([]);
            }
            const promises = [];
            files.forEach(file => {
                let testPath = Path.join(basedir, file).replace(/\\/g, '/');
                promises[promises.length] = new Promise<string>(resolve => {
                    File.stat(testPath, (err, stat) => {
                        if (err) {
                            return resolve();
                        }
                        if (stat.isDirectory()) {
                            fileList(testPath, mapIterator)
                                .then(r => result = result.concat(r))
                                .then(() => resolve())
                                .catch(() => resolve());
                            return;
                        }
                        testPath = mapIterator(testPath);
                        if (testPath) {
                            result.push(testPath);
                        }
                        resolve();
                    });
                });
            });
            const done = () => resolve(result);
            Promise.all(promises)
                .then(done)
                .catch(done);
        });
    });
}

export function findEntry(packageDir, { typings, main }) {
    if (typings) {
        return findFile(typings, packageDir);
    }
    if (!main) {
        main = 'index';
    }
    return findFile(main, packageDir);
}

export function readFile(filePath, options): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, options, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
}