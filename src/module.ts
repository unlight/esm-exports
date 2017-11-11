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

export function module(name: string): Promise<Entry[]> {
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
        // TODO: m.specifier can be directory (or specifier without extension we must use resolve mechanism here)
        const promises = unnamed.map(m => file(m.specifier, { basedir, module: name }).then(items => {
            entries.push(...items);
        }));
        return Promise.all(promises).then(() => {
            return entries;
        });
    });
}
