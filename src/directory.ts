import { readdir, stat } from 'fs';
import { Entry } from './entry';
import { file as parse } from './file';
import { extname, resolve } from 'path';

export const findFileExtensions = ['.ts', '.d.ts', '.js', '.tsx', '.jsx'];

export function directory(path: string, from?: string): Promise<Entry[]> {
    return new Promise<string[]>((resolve, reject) => {
        readdir(path, (err, files) => {
            if (err) return reject(err);
            resolve(files);
        });
    })
        .then(items => {
            const directories = [];
            const files = [];
            let count = items.length;
            return new Promise<{ directories: string[], files: string[] }>((done, reject) => {
                items.forEach(item => {
                    stat(resolve(path, item), (err, stats) => {
                        if (err) return reject(err);
                        if (stats.isDirectory()) {
                            directories.push(item);
                        } else if (stats.isFile()) {
                            const extension = extname(item);
                            if (findFileExtensions.includes(extension)) {
                                files.push(item);
                            }
                        }
                        count--;
                        if (count === 0) {
                            done({ directories, files });
                        }
                    });
                });
            })
                .then(({ directories, files }) => {
                    const result: Entry[] = [];
                    const promises = files.map(file => parse(file, path)
                        .then(entries => {
                            result.push(...entries);
                        }));
                    return Promise.all(promises)
                        .then(() => {
                            const promises = directories.map(d => {
                                return directory(d, path).then(entries => {
                                    result.push(...entries);
                                });
                            });
                            return Promise.all(promises).then(() => result);
                        });
                });
        });
}
