import * as Path from 'path';
import * as fs from 'fs';
import { parse } from './parse';
import get = require('lodash/get');
import endsWith = require('lodash/endsWith');
import { Entry } from './entry';
const resolvePkg = require('resolve-pkg');
const readFile: readFileResult = require('fs-readfile-promise');
import { findFile } from './find-file';
const resolve = require('resolve');

type readFileResult = (file: string, encoding?: string) => Promise<string>;

export type ParseModuleOptions = {
    dirname?: string;
    module?: string;
};

const parseModuleDefaults = {
    dirname: '.'
};

// function findInnerModules(directory: string) {
//     fs.readdirSync(directory)
//         .filter(path => (path !== '.' || path !== '..'))
//         .map(path => ({ path, stat: fs.statSync(path) }))
//         .filter(({ stat }) => stat.isDirectory())
//         .map(({ path }) => {
//             let packageFile = Path.join(path, 'package.json');
//             let pkgData = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
//             return get(pkgData, 'main', 'index');
//         })
//         // .map()

// }

export function parseModule(name: string, options: ParseModuleOptions = parseModuleDefaults): Promise<Entry[]> {
    let { dirname, module } = options;
    let packageDir = resolvePkg(name, { cwd: dirname });
    if (!packageDir) {
        return Promise.resolve([]);
    }
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
            return parse(sourceText, { filepath, module });
        })
        .catch(err => {
            return Promise.resolve([]);
        });
}

function findEntry(packageDir, { typings, main }) {
    if (typings) {
        return findFile(typings, packageDir);
    }
    if (!main) {
        main = 'index';
    }
    return findFile(main, packageDir);
}