import { readFile } from 'fs';
import { ParseOptions, parse } from './parse';
import { Entry } from './entry';
import { resolve } from 'path';

type FileOptions = {
    basedir?: string;
    module?: string;
}

export function file(path: string, options: FileOptions = {}): Promise<Entry[]> {
    const filepath = resolve(options.basedir, path);
    return new Promise((resolve, reject) => {
        readFile(filepath, { encoding: 'utf8' }, (err, data: string) => {
            if (err) return reject(err);
            resolve(parse(data, options));
        });
    });
}
