import * as Path from 'path';
import { parseFile } from './parse-file';
import flatten = require('lodash/flatten');
import startsWith = require('lodash/startsWith');
import { Entry } from './entry';
import { fileList } from './utils';

export function directory(target: string): Promise<Entry[]> {
    if (typeof target !== 'string') {
        return Promise.reject(new Error('Target must be a string'));
    }
    const targetNodeModules = Path.normalize(Path.join(target, 'node_modules')).replace(/\\/g, '/');
    const mapIterator = (file: string) => {
        if (['.ts', '.js'].indexOf(file.slice(-3)) === -1) return;
        if (startsWith(file, targetNodeModules)) return;
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