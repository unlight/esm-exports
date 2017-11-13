import { readdir, stat } from 'fs';
import { Entry } from './entry';
import { file as parse } from './file';
import { extname, resolve as resolvePath, parse as parsePath } from 'path';

export const findFileExtensions = ['.ts', '.d.ts', '.js', '.tsx', '.jsx'];

type DirectoryOptions = {
    basedir?: string;
};

export function directory(path: string, options: DirectoryOptions = {}): Promise<Entry[]> {
    try {
        var dirpath = resolvePath(options.basedir || '.', path);
    } catch (err) {
        return Promise.reject(err);
    }
    return new Promise<string[]>((done, reject) => {
        readdir(dirpath, (err, files) => {
            if (err) {
                return reject(err);
            }
            done(files);
        });
    }).then((items: string[]) => {
        const directories: string[] = [];
        const files: string[] = [];
        let count = items.length;
        if (count === 0) {
            return Promise.resolve([]);
        }
        return new Promise<{ directories: string[], files: string[] }>((done, reject) => {
            const names = Object.create(null);
            items.forEach(item => {
                stat(resolvePath(dirpath, item), (err, stats) => {
                    if (err) {
                        return reject(err);
                    }
                    if (stats.isDirectory()) {
                        directories.push(item);
                    } else if (stats.isFile()) {
                        const { name, ext } = parsePath(item);
                        if (names[name] === undefined) {
                            if (findFileExtensions.includes(ext)) {
                                files.push(item);
                                names[name] = true;
                            }
                        }
                    }
                    count--;
                    if (count === 0) {
                        done({ directories, files });
                    }
                });
            });
        }).then(({ directories, files }) => {
            const result: Entry[] = [];
            const options = { basedir: dirpath };
            const promises = files.map(file => parse(file, options)
                .then(entries => {
                    result.push(...entries);
                }));
            return Promise.all(promises)
                .then(() => {
                    const promises = directories.map(d => {
                        return directory(d, options).then(entries => {
                            result.push(...entries);
                        });
                    });
                    return Promise.all(promises).then(() => result);
                });
        });
    });
}
