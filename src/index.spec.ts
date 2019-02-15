/* eslint-disable @typescript-eslint/tslint/config */
import * as assert from 'assert';
import { main } from './index';

it('smoke test', () => {
    assert(main);
});

it('var export', () => {
    const result = main(`export var test = 1`);
    assert(result.find(x => x.name === 'test'));
});

it('declare module', () => {
    const result = main(`
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

it('several var export', () => {
    const result = main(`export var aaa, bbb`);
    assert(result.find(x => x.name === 'aaa'));
    assert(result.find(x => x.name === 'bbb'));
});

it('export several vars', () => {
    const result = main(`export {somevar, otherVar}`);
    assert(result.find(x => x.name === 'somevar'));
    assert(result.find(x => x.name === 'otherVar'));
});

it('export function', () => {
    const result = main(`export function dummy() {}`);
    assert(result.find(x => x.name === 'dummy'));
});

it('export interface', () => {
    const result = main(`export interface Entry {}`);
    assert(result.find(x => x.name === 'Entry'));
});

it('export default var', () => {
    const result = main(`export default component`);
    assert(result.find(x => x.name === 'component' && x.isDefault === true));
});

it('export default', () => {
    const result = main(`export default function foo() {}`);
    assert(result.find(x => x.name === 'foo' && x.isDefault === true));
});

it('export declare class', () => {
    const result = main(`export declare class Calendar`);
    assert(result.find(x => x.name === 'Calendar'));
});

it('export all', () => {
    const result = main(`export * from './provider'`);
    assert(result.find(x => x.specifier === './provider'));
});

it('export some from module', () => {
    const result = main(`export {var1} from './provider'`);
    assert(result.find(x => x.name === 'var1'));
});

it('pick export', () => {
    const result = main(`export { CalendarEvent, EventAction } from 'calendar-utils'`);
    assert(result.find(x => x.name === 'CalendarEvent'));
    assert(result.find(x => x.name === 'EventAction'));
});

it('export class', () => {
    const result = main(`export class Aaa`);
    assert(result.find(x => x.name === 'Aaa'));
});

it('empty source', () => {
    const result = main('');
    assert.deepEqual(result, []);
});

it('object binding', () => {
    const result = main(`export const {ModuleStore} = $traceurRuntime`);
    assert(result.find(x => x.name === 'ModuleStore'));
});

it('should extract declared module http', () => {
    const result = main(`declare module "http" {
        export var METHODS: string[];
        export const c1, c2: any;
    }
    `);
    assert(result.find(x => x.module === 'http' && x.name === 'METHODS'));
    assert(result.find(x => x.module === 'http' && x.name === 'c1'));
    assert(result.find(x => x.module === 'http' && x.name === 'c2'));
});

it('should extract declared module events', () => {
    const result = main(`declare module "events" {
        class internal extends NodeJS.EventEmitter { }
        namespace internal {
            export class EventEmitter extends internal {
            }
        }
        export = internal;
    }`);
    assert(result.find(x => x.name === 'EventEmitter' && x.module === 'events'));
});

it('not too deep parse', () => {
    const result = main(`
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

it('duplicates must be removed', () => {
    const result = main(`
    export function spawnSync(command: string): SpawnSyncReturns<Buffer>;
    export function spawnSync(command: string, options?: SpawnSyncOptionsWithStringEncoding): SpawnSyncReturns<string>;
`);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'spawnSync');
});

// it('simulated commonjs', () => {
//     const source = `
// declare namespace e {
//     interface Request extends core.Request { }
// }
// declare namespace d {
//     declare const x = 1;
//     function y() {}
// }
// export = e;
// `;
//     const result = main(source, { module: 'somecjs' });
//     assert.equal(result[0].name, 'Request');
//     assert.equal(result[0].cjs, true);
// });

// it('preact declaration', () => {
//     const source = `
// declare namespace preact {
//     function rerender();
//     type AnyComponent = {};
// }
// declare module "preact" {
//     export = preact;
// }
// `;
//     const result = main(source, { module: 'preact' });
//     assert(result[0].name === 'rerender');
//     assert(result[1].name === 'AnyComponent');
// });

// it('react definitions', () => {
//     const source = `
// export = React;
// export as namespace React;
// declare namespace React {
//     type ReactType<P = any> = string | ComponentType<P>;
//     interface Component<P = {}, S = {}> extends ComponentLifecycle<P, S> { }
//     class PureComponent<P = {}, S = {}> extends Component<P, S> { }
// }
// `;
//     const result = main(source);
//     assert(result.length > 0);
//     assert(result.find(e => e.name === 'ReactType'));
//     assert(result.find(e => e.name === 'Component'));
//     assert(result.find(e => e.name === 'PureComponent'));
// });

// it('webpack', () => {
//     const source = `
//         export = webpack;
//         declare function webpack(options?: webpack.Configuration): webpack.Compiler;
//         declare namespace webpack {
//             interface Configuration {
//             }
//         }
//     `;
//     const result = main(source, { module: 'webpack' });
//     const configuration: Entry = result.find(e => e.name === 'Configuration');
//     assert(configuration);
// });

// it('declare module function', () => {
//     const source = `
//     declare module "fs" {
//         function readFile();
//     }
//     `;
//     const result = main(source, { module: '@types/node' });
//     assert(result.length === 1);
//     assert(result.find(e => e.module === 'fs' && e.name === 'readFile'));
// });
