import { readFile } from 'fs';
import { ParseOptions, parse } from './parse';
import { Entry } from './entry';
import { resolve as resolvePath } from 'path';

type FileOptions = {
    basedir?: string;
    module?: string;
}

export function file(path: string, options: FileOptions = {}): Promise<Entry[]> {
    const filepath = resolvePath(options.basedir || '.', path);
    return new Promise((done, reject) => {
        readFile(filepath, { encoding: 'utf8' }, (err, data: string) => {
            if (err) return reject(err);
            done(parse(data, { ...options, filepath }));
        });
    });
}
