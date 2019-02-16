/* eslint-disable @typescript-eslint/tslint/config */
import * as assert from 'assert';
import { main } from './index';
import { normalize } from 'path';
const pkgDir = require('pkg-dir');
const rootPath = pkgDir.sync();

it('smoke test', () => {
    assert(main);
});

it('var export', async () => {
    const result = await main(`export var test = 1`);
    assert(result.find(x => x.name === 'test'));
});

it('declare module', async () => {
    const result = await main(`
    declare module "fs" {
        namespace access {
            foo();
        }
        function readFile();
    }
    `);
    assert(result.find(x => x.name === 'access' && x.module === 'fs'));
    assert(result.find(x => x.name === 'readFile' && x.module === 'fs'));
});

it('several var export', async () => {
    const result = await main(`export var aaa, bbb`);
    assert(result.find(x => x.name === 'aaa'));
    assert(result.find(x => x.name === 'bbb'));
});

it('export several vars', async () => {
    const result = await main(`export {somevar, otherVar}`);
    assert(result.find(x => x.name === 'somevar'));
    assert(result.find(x => x.name === 'otherVar'));
});

it('export function', async () => {
    const result = await main(`export function dummy() {}`);
    assert(result.find(x => x.name === 'dummy'));
});

it('export interface', async () => {
    const result = await main(`export interface Entry {}`);
    assert(result.find(x => x.name === 'Entry'));
});

it('export default var', async () => {
    const result = await main(`export default component`);
    assert(result.find(x => x.name === 'component' && x.isDefault === true));
});

it('export default', async () => {
    const result = await main(`export default function foo() {}`);
    assert(result.find(x => x.name === 'foo' && x.isDefault === true));
});

it('export declare class', async () => {
    const result = await main(`export declare class Calendar`);
    assert(result.find(x => x.name === 'Calendar'));
});

it('export some from module', async () => {
    const result = await main(`export {var1} from './provider'`);
    assert(result.find(x => x.name === 'var1'));
});

it('pick export', async () => {
    const result = await main(`export { CalendarEvent, EventAction } from 'calendar-utils'`);
    assert(result.find(x => x.name === 'CalendarEvent'));
    assert(result.find(x => x.name === 'EventAction'));
});

it('export class', async () => {
    const result = await main(`export class Aaa`);
    assert(result.find(x => x.name === 'Aaa'));
});

it('empty source', async () => {
    const result = await main('');
    assert.deepEqual(result, []);
});

it('object binding', async () => {
    const result = await main(`export const {ModuleStore} = $traceurRuntime`);
    assert(result.find(x => x.name === 'ModuleStore'));
});

it('should extract declared module http', async () => {
    const result = await main(`declare module "http" {
        export var METHODS: string[];
        export const c1, c2: any;
    }
    `);
    assert(result.find(x => x.module === 'http' && x.name === 'METHODS'));
    assert(result.find(x => x.module === 'http' && x.name === 'c1'));
    assert(result.find(x => x.module === 'http' && x.name === 'c2'));
});

it('should extract declared module events', async () => {
    const result = await main(`declare module "events" {
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
    const result = await main(`
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
    const result = await main(`
    export function spawnSync(command: string): SpawnSyncReturns<Buffer>;
    export function spawnSync(command: string, options?: SpawnSyncOptionsWithStringEncoding): SpawnSyncReturns<string>;
`);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'spawnSync');
});

it('preact declaration', async () => {
    const result = await main(`
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
    const result = await main(`
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
    const result = await main(`
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
    const result = await main(`
    declare module "fs" {
        function readFile();
    }
    `, { module: '@types/node', result: [] });
    assert(result.find(e => e.module === 'fs' && e.name === 'readFile'));
});

it('simulated commonjs', async () => {
    const result = await main(`
declare namespace e {
    interface Request extends core.Request { }
}
declare namespace d {
    declare const x = 1;
    function y() {}
}
export = e;
`, { module: 'somecjs', result: [] });
    assert.equal(result[0].module, 'somecjs');
    assert.equal(result[0].name, 'Request');
    assert.equal(result[0].cjs, undefined);
});

it('export all', async () => {
    const result = await main(`export * from './provider'`);
    assert.equal(result[0].specifier, './provider');
});

it('import all should contain name', async () => {
    const result = await main(`${rootPath}/fixtures/component/index.ts`, { type: 'file' });
    assert(result.length > 0);
    assert(result.filter(m => !m.name).length === 0, 'all entries must have name');
    assert(result.filter(m => m.module).length === 0, 'module property must be falsy');
    const [abc] = result.filter(m => m.name === 'AbcComponent');
    assert.equal(abc.filepath, normalize(`${rootPath}/fixtures/component/index.ts`));
    const [x2] = result.filter(m => m.name === 'x2');
    assert.equal(x2.filepath, normalize(`${rootPath}/fixtures/component/index.ts`));
});

it('try to parse unexisting file', async () => {
    const result = await file(`${rootPath}/fixtures/lead-to-unknown.ts`);
    assert(result.length === 0);
});
