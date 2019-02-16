/* eslint-disable @typescript-eslint/tslint/config */
import assert = require('assert');
import { main } from './index';
import { normalize } from 'path';
import { Entry } from './entry';
const pkgDir = require('pkg-dir');
const rootPath = pkgDir.sync();

let entry: Entry;
let result: Entry[];

it('smoke test', () => {
    assert(main);
});

it('id function', () => {
    const entry = new Entry({ name: 'abc', module: 'mod' });
    assert.equal(entry.id(), 'abc/mod');
});

it('serialization should not contain private properties', () => {
    const entry = new Entry({ name: 'abc', module: 'mod' });
    const unserialized = JSON.parse(JSON.stringify(entry));
    assert.deepEqual(Object.keys(unserialized), ['name', 'isDefault', 'module']);
});


it('var export', async () => {
    result = await main(`export var test = 1`);
    entry = result.find(x => x.name === 'test');
    assert(entry);
});

it('declare module', async () => {
    result = await main(`
    declare module "fs" {
        namespace access {
            foo();
        }
        function readFile();
    }
    `);
    entry = result.find(x => x.name === 'access' && x.module === 'fs');
    assert(entry);
    entry = result.find(x => x.name === 'readFile' && x.module === 'fs');
    assert(entry);
});

it('several var export', async () => {
    result = await main(`export var aaa, bbb`);
    assert(result.find(x => x.name === 'aaa'));
    assert(result.find(x => x.name === 'bbb'));
});

it('export several vars', async () => {
    result = await main(`export {somevar, otherVar}`);
    assert(result.find(x => x.name === 'somevar'));
    assert(result.find(x => x.name === 'otherVar'));
});

it('export function', async () => {
    result = await main(`export function dummy() {}`);
    assert(result.find(x => x.name === 'dummy'));
});

it('export interface', async () => {
    result = await main(`export interface Entry {}`);
    assert(result.find(x => x.name === 'Entry'));
});

it('export default var', async () => {
    result = await main(`export default component`);
    assert(result.find(x => x.name === 'component' && x.isDefault === true));
});

it('export default', async () => {
    result = await main(`export default function foo() {}`);
    assert(result.find(x => x.name === 'foo' && x.isDefault === true));
});

it('export declare class', async () => {
    result = await main(`export declare class Calendar`);
    assert(result.find(x => x.name === 'Calendar'));
});

it('export some from module', async () => {
    result = await main(`export {var1} from './provider'`);
    assert(result.find(x => x.name === 'var1'));
});

it('pick export', async () => {
    result = await main(`export { CalendarEvent, EventAction } from 'calendar-utils'`);
    assert(result.find(x => x.name === 'CalendarEvent'));
    assert(result.find(x => x.name === 'EventAction'));
});

it('export class', async () => {
    result = await main(`export class Aaa`);
    assert(result.find(x => x.name === 'Aaa'));
});

it('empty source', async () => {
    result = await main('');
    assert.deepEqual(result, []);
});

it('object binding', async () => {
    result = await main(`export const {ModuleStore} = $traceurRuntime`);
    assert(result.find(x => x.name === 'ModuleStore'));
});

it('should extract declared module http', async () => {
    result = await main(`declare module "http" {
        export var METHODS: string[];
        export const c1, c2: any;
    }
    `);
    assert(result.find(x => x.module === 'http' && x.name === 'METHODS'));
    assert(result.find(x => x.module === 'http' && x.name === 'c1'));
    assert(result.find(x => x.module === 'http' && x.name === 'c2'));
});

it('should extract declared module events', async () => {
    result = await main(`declare module "events" {
        class internal extends NodeJS.EventEmitter { }
        namespace internal {
            export class EventEmitter extends internal {
            }
        }
        export = internal;
    }`);
    assert(result.find(x => x.name === 'EventEmitter' && x.module === 'events'));
});

it('not too deep parse', async () => {
    result = await main(`
    export function deep() {
        const x = {a: {c: {d: 1}}};
        return () => a => b => c => () => ({
            export = x;
        });
    };
}`);
    assert.equal(result.length, 1);
    assert(result.find(x => x.name === 'deep'));
});

it('duplicates must be removed', async () => {
    result = await main(`
    export function spawnSync(command: string): SpawnSyncReturns<Buffer>;
    export function spawnSync(command: string, options?: SpawnSyncOptionsWithStringEncoding): SpawnSyncReturns<string>;
`);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'spawnSync');
});

it('preact declaration', async () => {
    result = await main(`
declare namespace internal {
    function rerender();
    type AnyComponent = {};
}
declare module "preact" {
    export = internal;
}
`, { module: 'preact', result: [] });
    assert(result.find(x => x.name === 'rerender' && x.module === 'preact'));
    assert(result.find(x => x.name === 'AnyComponent' && x.module === 'preact'));
});

it('react definitions', async () => {
    result = await main(`
export = React;
export as namespace React;
declare namespace React {
    type ReactType<P = any> = string | ComponentType<P>;
    interface Component<P = {}, S = {}> extends ComponentLifecycle<P, S> { }
    class PureComponent<P = {}, S = {}> extends Component<P, S> { }
}
`, { result: [], module: 'react' });
    assert(result.length > 0);
    assert(result.find(x => x.module === 'react' && x.name === 'ReactType'));
    assert(result.find(x => x.module === 'react' && x.name === 'Component'));
    assert(result.find(x => x.module === 'react' && x.name === 'PureComponent'));
});

it('webpack', async () => {
    result = await main(`
        export = webpack;
        declare function webpack(options?: webpack.Configuration): webpack.Compiler;
        declare namespace webpack {
            interface Configuration {
            }
        }
    `, { module: 'webpack', result: [] });
    assert(result.find(e => e.name === 'Configuration'));
});

it('declare module function', async () => {
    result = await main(`
    declare module "fs" {
        function readFile();
    }
    `, { module: '@types/node', result: [] });
    assert(result.find(e => e.module === 'fs' && e.name === 'readFile'));
});

it('simulated commonjs', async () => {
    result = await main(`
declare namespace e {
    interface Request extends core.Request { }
}
declare namespace d {
    declare const x = 1;
    function y() {}
}
export = e;
`, { module: 'somecjs', result: [] });
    entry = result[0];
    assert.equal(entry.module, 'somecjs');
    assert.equal(entry.name, 'Request');
    assert.equal(entry.cjs, undefined);
});

it.skip('export all', async () => {
    result = await main(`export * from './provider'`);
    entry = result[0];
    assert.equal(entry.specifier, './provider');
});

it('import all should contain name', async () => {
    result = await main(normalize(`${rootPath}/fixtures/component/index.ts`), { type: 'file' });
    assert.notEqual(result.length, 0, 'no entries');
    assert.equal(result.filter(x => !x.name).length, 0, 'all entries must have name');
    assert.equal(result.filter(m => m.module).length, 0, 'module property must be falsy');
    entry = result.find(m => m.name === 'AbcComponent');
    assert.equal(entry.filepath, normalize(`${rootPath}/fixtures/component/index.ts`));
    entry = result.find(m => m.name === 'x2');
    assert.equal(entry.filepath, normalize(`${rootPath}/fixtures/component/index.ts`));
});

it('try to parse unexisting file', async () => {
    result = await main(normalize(`${rootPath}/fixtures/lead-to-unknown.ts`), { type: 'file' });
    assert.deepEqual(result, []);
});

it.skip('try to parse export from core', async () => {
    result = await main(normalize(`${rootPath}/fixtures/export-from-core.ts`), { type: 'file' });
    assert.deepEqual(result, []);
});

it('should parse directory', async () => {
    result = await main(normalize(`${rootPath}/src`), { type: 'directory' });
    entry = result.find(x => x.name === 'Entry');
    assert.equal(entry.filepath, normalize(`${rootPath}/src/entry.ts`));
    assert.equal(result.filter(m => !m.name).length, 0, 'Missing name');
    entry = result.find(x => x.filepath === normalize(`${rootPath}/src/index.ts`));
    assert(entry);
});

it('directory target null', async () => {
    await main(undefined, { type: 'directory' });
});

it('not existing target', async () => {
    await main(`${rootPath}/foo`);
});

it('relative directory', async () => {
    result = await main('src', { type: 'directory' });
    assert.equal(result.filter(m => !m.name).length, 0, 'Missing names');
    assert.notEqual(result.length, 0);
});

it('should ignore node_modules', async function () {
    result = await main(`${rootPath}/fixtures`, { type: 'directory' });
    assert.equal(result.filter(m => !m.name).length, 0, 'Missing names');
    const ts = result.filter(item => item.module === 'typescript');
    assert.equal(ts.length, 0, 'Typescript modules');
    const nodeModules = result.filter(item => item.filepath && item.filepath.indexOf('node_modules') !== -1);
    assert.equal(nodeModules.length, 0, 'node_modules in filepath');
});

it('node core with additional functions', () => {
    const source = `
        declare module "assert" {
            function internal(value: any, message?: string): void;
            namespace internal {
                export function ifError(value: any): void;
            }
            export = internal;
        }
    `;
    const result = parse(source);
    assert(result.length === 2);
    const [entry2] = result;
    assert.equal(entry2.name, 'ifError');
    assert.equal(entry2.module, 'assert');
    assert.equal(entry2.isDefault, false);
});

it('commonjs module.exports 1', () => {
    const source = `module.exports.myfunc = () => {}`;
    const [entry] = parse(source);
    assert(entry);
    assert.equal(entry.name, 'myfunc');
    assert.equal(entry.isDefault, false);
});

it.skip('commonjs module.exports 2', () => {
    const source = `this.myfunc = 1`;
    const [entry] = parse(source);
    assert(entry);
    assert.equal(entry.name, 'myfunc');
    assert.equal(entry.isDefault, false);
});

it.skip('declare namespace', () => {
    const source = `
        declare namespace through2 {
        }
        export = through2
    `;
    const [entry] = parse(source);
    assert.ifError(entry.module);
    assert.equal(entry.isDefault, true);
});

it.skip('export as namespace', () => {
    const source = `
        export = _;
        export as namespace _;
    `;
    const result = parse(source);
});

it('should take only file by findFileExtensions', async () => {
    result = await directory(`${__dirname}/../fixtures`);
    assert(result);
    assert(result.filter(m => !m.name).length === 0, 'all entries must have name');
    assert(result.filter(x => x.name === 'NotADummyComponent').length === 0);
    assert.equal(result[0].name, 'DummyComponent');
    assert.equal(result[0].filepath, normalize(`${__dirname}/../fixtures/dummy.component.ts`));
});

it('angular2-calendar', async () => {
    result = await parse('angular2-calendar', { basedir: rootPath });
    const [first] = result;
    assert.equal(first.module, 'angular2-calendar');
    const calendarEventTitleEntry = result.find(item => item.name === 'CalendarEventTitle');
    assert(calendarEventTitleEntry);
    assert.equal(calendarEventTitleEntry.module, 'angular2-calendar');
    assert(result.filter(m => !m.name).length === 0, 'all entries must have name');
});

it('rxjs module, node_modules names should be uniq', async () => {
    result = await parse('rxjs', { basedir: rootPath });
    const ids = result.map(item => item.id());
    const uniqIds: string[] = [...new Set(ids)];
    assert.equal(uniqIds.length, ids.length);
    assert(result.filter(m => !m.name).length === 0, 'all entries must have name');
});

it('gulp-tslint', async () => {
    result = await parse('gulp-tslint', { basedir: rootPath });
    const falsyNodes = result.filter(v => !v);
    assert(falsyNodes.length === 0);
    const pluginOptions = result.find(v => v.name === 'PluginOptions');
    assert(pluginOptions);
    assert(pluginOptions.module === 'gulp-tslint');
    assert(result.filter(m => !m.name).length === 0, 'all entries must have name');
});

it('no falsy nodes', async () => {
    result = await parse('@angular/core', { basedir: rootPath });
    const falsyNodes = result.filter(v => !v);
    assert(falsyNodes.length === 0);
    assert(result.filter(m => !m.name).length === 0, 'all entries must have name');
});

it('parse unknown module', async () => {
    result = await parse('unknown_module_foo', { basedir: rootPath });
    assert(result.length === 0);
    assert(result.filter(m => !m.name).length === 0, 'all entries must have name');
});

it('inner module', async () => {
    result = await parse('@angular/core/testing', { basedir: rootPath });
    const inject = result.find(n => n.name === 'inject');
    assert(inject);
    const TestBed = result.find(n => n.name === 'TestBed');
    assert(TestBed);
    assert(result.filter(m => !m.name).length === 0, 'all entries must have name');
});

it('should find inner module properly', async () => {
    result = await parse('@angular/core', { basedir: rootPath });
    const testing = result.filter(n => n.module === '@angular/core/testing');
    assert(testing.length);
    const inject = result.filter(n => n.name === 'inject');
    assert.notEqual(inject.length, 0);
    assert(result.filter(m => !m.name).length === 0, 'all entries must have name');
});

it('should not contain duplicated entries (modules)', async () => {
    result = await parse('@angular/core', { basedir: rootPath });
    const inject = result.filter(n => n.name === 'inject' && n.module === '@angular/core');
    assert.equal(inject.length, 1);
    const TestBed = result.filter(n => n.name === 'TestBed');
    assert.equal(TestBed.length, 1);
    assert(result.filter(m => !m.name).length === 0, 'all entries must have name');
});

it('types node', async () => {
    result = await parse('@types/node', { basedir: rootPath });
    const bastards = result.filter(m => m.module === '@types/node');
    assert.equal(bastards.length, 0, 'globals should be eliminated');
    const buffer = result.filter(m => m.module === 'buffer');
    assert(buffer.length > 0);
    const spawnSyncList = result.filter(m => m.name === 'spawnSync' && m.module === 'child_precess');
    assert(result.filter(m => !m.name).length === 0, 'all entries must have name');
});

it.skip('types node events', async () => {
    result = await parse('@types/node', { basedir: rootPath });
    const events = result.filter(m => m.module === 'events');
    assert(events.length > 0);
});

it('commonjs modules pkg-dir', async () => {
    result = await parse('pkg-dir', { basedir: rootPath });
    assert(result.length > 0);
    assert(result.filter(m => m.module !== 'pkg-dir').length === 0);
    const [entry] = result;
    assert(entry.module === 'pkg-dir');
    assert(entry.cjs === true);
});

it('types express', async () => {
    result = await parse('@types/express', { basedir: rootPath });
    assert(result.length > 0);
    const request = result.find(n => n.name === 'Request');
    assert(request);
    assert(request.module === 'express');
});

it('types fs-extra', async () => {
    result = await parse('@types/fs-extra', { basedir: rootPath });
    assert(result.length > 0);
    const [copy] = result.filter(m => m.name === 'copy');
    assert(copy);
    const [copyOptions] = result.filter(m => m.name === 'CopyOptions');
    assert(copyOptions);
});

it('preact', async () => {
    result = await parse('preact', { basedir: rootPath });
    assert(result.length > 0);
});

it('hover', async () => {
    result = await parse('hover', { basedir: rootPath });
    assert(result.length > 0);
});

it('type-zoo', async () => {
    result = await parse('type-zoo', { basedir: rootPath });
    assert.notEqual(result.length, 0);
    assert(result.find(f => f.name === 'Required'));
    assert(result.find(f => f.name === 'unknown'));
});

it('material-design-iconic-font contains invalid package main', async () => {
    result = await parse('material-design-iconic-font', { basedir: rootPath });
});
