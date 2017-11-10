import { readFile } from 'fs';
import { ParseOptions, parse } from './parse';
import { Entry } from './entry';
import { resolve } from 'path';

export function file(path: string, from: string = '.'): Promise<Entry[]> {
    const filepath = resolve(from, path);
    return new Promise((resolve, reject) => {
        readFile(filepath, { encoding: 'utf8' }, (err, data: string) => {
            if (err) return reject(err);
            resolve(parse(data));
        });
    });
}
