import * as Path from 'path';
import * as fs from 'fs';
import { parse, parseDefinitions } from './parse';
import * as _ from 'lodash';
import { Entry } from './entry';
const resolvePkg = require('resolve-pkg');
const readFile: readFileResult = require('fs-readfile-promise');
import { directory } from './directory';
import { findFile, uniqEntryList } from './utils';
const resolve = require('resolve');

type readFileResult = (file: string, encoding?: string) => Promise<string>;

export type ParseModuleOptions = {
    dirname?: string;
    module?: string;
};

const parseModuleDefaults = {
    dirname: '.'
};

function findInnerModules(basename: string, cwd: string): Promise<Entry[]> {
    let p = Promise.resolve([]);
    fs.readdirSync(cwd)
        .filter(name => name !== '.' && name !== '..')
        .map(name => ({ name, packageFile: Path.resolve(cwd, name, 'package.json') }))
        .filter(({ packageFile }) => fs.existsSync(packageFile))
        .map(({ name }) => name)
        .forEach(name => {
            let d = Path.resolve(cwd, name);
            p = p.then(result => directory(d).then(entries => {
                entries.forEach(e => e.module = `${basename}/${name}`);
                return result.concat(entries);
            }));
        });
    return p;
}

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
            // if (_.endsWith(filepath, '.d.ts')) {
            //     console.log('filepath', filepath);
            //     var tmp = parseDefinitions(sourceText, { module: name });
            //     console.log('tmp', tmp);
            // }
            if (!module) module = name;
            return parse(sourceText, { filepath, module });
        })
        .catch(err => {
            return Promise.resolve([]);
        })
        .then(result => {
            return findInnerModules(name, packageDir)
                .catch(err => Promise.resolve([]))
                .then(entries => result.concat(entries));
        })
        .then(entryList => uniqEntryList(entryList));
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