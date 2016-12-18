import * as Path from 'path';
import * as fs from 'fs';
import { parse } from './parse';
import { get, endsWith } from 'lodash';
import { Entry } from './entry';
const resolvePkg = require('resolve-pkg');
type readFileResult = (file: string, enc?: string) => Promise<string>;
const readFile: readFileResult = require('fs-readfile-promise');
import { findFile } from './find-file';

export type ParseModuleOptions = {
    dirname?: string;
    module?: string;
};

const defaults = {
    dirname: '.'
};

export function parseModule(name: string, options: ParseModuleOptions = defaults): Promise<Entry[]> {
    let {dirname, module} = options;
    let packageDir = resolvePkg(name, { cwd: dirname });
    // TODO: Check packageDir for null.
    // console.log('packageDir', packageDir);
    let filepath: string;
    let packageFile = Path.join(packageDir, 'package.json');
    let pkgData = require(packageFile);
    return findEntry(packageDir, pkgData)
        .then(file => {
            if (!file) {
                return Promise.reject(undefined);
            }
            filepath = file;
            return readFile(filepath, 'utf8');
        })
        .then((sourceText: string) => {
            if (!module) module = name;
            // console.log('options', options);
            // console.log('sourceText', sourceText);
            // let o = Object.assign({}, options, { module, file, dirname });
            return parse(sourceText, { filepath, module });
        })
        .catch(err => {
            return Promise.resolve([]);
        });
}

function findEntry(packageDir, {typings, main}) {
    if (typings) {
        return findFile(typings, packageDir);
    }
    if (!main) {
        main = 'index';
    }
    return findFile(main, packageDir);
}