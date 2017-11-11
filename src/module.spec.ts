import * as assert from 'assert';
import { Entry } from './entry';
import { module as parse } from './module';
const pkgDir = require('pkg-dir');
const rootPath = pkgDir.sync();

it('parse module smoke', () => {
    assert(parse);
});

it('angular2-calendar', async function() {
    const result = await parse('angular2-calendar', { basedir: rootPath });
    const [first] = result;
    assert.equal(first.module, 'angular2-calendar');
    const calendarEventTitleEntry = result.find(item => item.name === 'CalendarEventTitle');
    assert(calendarEventTitleEntry);
    assert.equal(calendarEventTitleEntry.module, 'angular2-calendar');
});

it('rxjs module, node_modules names should be uniq', async () => {
    const result = await parse('rxjs', { basedir: rootPath });
    const names = result.map(item => item.name);
    const uniqNames = Array.from(new Set(names));
    assert.equal(uniqNames.length, names.length);
});

it('gulp-tslint', async () => {
    const nodes = await parse('gulp-tslint', { basedir: rootPath });
    const falsyNodes = nodes.filter(v => !v);
    assert(falsyNodes.length === 0);
    const pluginOptions = nodes.find(v => v.name === 'PluginOptions');
    assert(pluginOptions);
    assert(pluginOptions.module === 'gulp-tslint');
});

it('no falsy nodes', async () => {
    const nodes = await parse('@angular/core', { basedir: rootPath });
    const falsyNodes = nodes.filter(v => !v);
    assert(falsyNodes.length === 0);
});

it.skip('parse unknown module', async () => {
    const nodes = await parse('unknown_module_foo', { basedir: rootPath });
    assert(nodes.length === 0);
});

it.only('should find inner module properly', async () => {
    const nodes = await parse('@angular/core', { basedir: rootPath });
    const testing = nodes.filter(n => n.module === '@angular/core/testing');
    assert(testing.length);
    const inject = nodes.filter(n => n.name === 'inject');
    assert.notEqual(inject.length, 0);
});

// it.only('should not contain duplicated entries (modules)', async () => {
//     const nodes = await parse('@angular/core', { basedir: rootPath });
//     const inject = nodes.filter(n => n.name === 'inject');
//     assert.equal(inject.length, 1);
// });

// it.only('should not contain duplicated entries (src)', () => {
//     const entries = [
//         new Entry({ name: 'name1', filepath: '/directory/file1' } as any),
//         new Entry({ name: 'name1', filepath: '/directory/file1' } as any),
//     ]
//     entries = uniqEntryList(entries);
//     assert.equal(entries.length, 1);
// });

// it.only('types node', async () => {
//     const nodes = await parse('@types/node', { basedir: rootPath });
//     const buffer = nodes.filter(m => m.module === 'buffer');
//     const events = nodes.filter(m => m.module === 'events');
//     assert(events.length > 0);
//     assert(buffer.length > 0);
// });

// it.only('globals should be eliminated', async () => {
//     const nodes = await parse('@types/node', { basedir: rootPath });
//     const bastards = nodes.filter(m => m.module === '@types/node');
//     assert.equal(bastards.length, 0);
// });

