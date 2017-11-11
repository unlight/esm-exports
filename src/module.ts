import resolve = require('resolve');
import { findFileExtensions } from './directory';
import { file } from './file';
import { Entry } from './entry';
import { AsyncOpts } from 'resolve';
import { dirname } from 'path';

const SCOPE_TYPES = '@types/';

const resolveOptions: AsyncOpts = {
    extensions: findFileExtensions,
    packageFilter: (pkg: any) => {
        const { typings, module } = pkg;
        if (typings) pkg.main = typings;
        else if (module) pkg.main = module;
        return pkg;
    },
};

type ModuleOptions = {
    basedir?: string;
}

export function module(name: string, options: ModuleOptions = {}): Promise<Entry[]> {
    return new Promise<{ entries: Entry[], resolved: string }>((done, reject) => {
        resolve(name, resolveOptions, (err, resolved) => {
            if (err) return reject(err);
            if (resolved) {
                return file(resolved, { module: name }).then(entries => done({ entries, resolved }), reject);
            }
            done({ entries: [], resolved: null });
        });
    }).then(({ entries, resolved }) => {
        if (!resolved) {
            return entries;
        }
        const unnamed = entries.filter(m => m.name == null);
        // TODO: Remove unnamed from entries.
        const basedir = dirname(resolved);
        const promises = unnamed.map(m => {
            return new Promise<Entry[]>((done, reject) => {
                resolve(m.specifier, { ...resolveOptions, basedir }, (err, resolved) => {
                    if (err) return reject(err);
                    if (resolved) {
                        return file(resolved, { module: name }).then(done, reject);
                    }
                    done([]);
                });
            }).then(items => {
                entries.push(...items);
            });
        });
        return Promise.all(promises).then(() => {
            return entries;
        });
    }).then(entries => {
        // TODO: Find inner modules.
        return entries;
    });
}
