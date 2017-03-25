import * as Path from 'path';
import { parseFile } from './parse-file';
import flatten = require('lodash/flatten');
import { Entry } from './entry';
import { fileList } from './utils';

export function directory(target: string): Promise<Entry[]> {
    if (typeof target !== 'string') {
        return Promise.reject(new Error('Target must be a string'));
    }
    const mapIterator = (file: string) => {
        if (file.indexOf('node_modules/') > 0) return null;
        if (['.ts', '.js'].indexOf(file.slice(-3)) === -1) return null;
        return file;
    };
    return fileList(target, mapIterator)
        .catch(err => [])
        .then<Entry[]>((files: string[]) => {
            return Promise.all(
                files.map(file => {
                    file = Path.resolve(file);
                    return parseFile(file, { dirname: target });
                }))
                .then(result => {
                    return flatten<any>(result);
                });
        });
}