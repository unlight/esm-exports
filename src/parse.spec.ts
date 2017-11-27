import * as assert from 'assert';
import { parse } from './parse';

it('smoke test', () => {
    assert(parse);
});

it('var export', () => {
    let code = `export var aaa = 1`;
    let [result] = parse(code);
    assert.equal(result.name, 'aaa');
});

it('several var export', () => {
    let code = `export var aaa, bbb`;
    let [result, result2] = parse(code);
    assert.equal(result.name, 'aaa');
    assert.equal(result2.name, 'bbb');
});

it('export all', () => {
    let code = `export * from './provider'`;
    let [result] = parse(code);
    assert.equal(result.specifier, './provider');
});

it('export some from module', () => {
    let code = `export {var1} from './provider'`;
    let [result] = parse(code);
    assert.equal(result.name, 'var1');
    assert.equal(result.specifier, './provider');
});

it('pick export', () => {
    let code = `export { CalendarEvent, EventAction } from 'calendar-utils'`;
    var [first, second] = parse(code);
    assert.equal(first.name, 'CalendarEvent');
    assert.equal(first.specifier, 'calendar-utils');
    assert.equal(second.name, 'EventAction');
});

it('export declare class', () => {
    let code = `export declare class Calendar`;
    let [result] = parse(code);
    assert.equal(result.name, 'Calendar');
});

it('export class', () => {
    let code = `export class Aaa`;
    let [result] = parse(code);
    assert.equal(result.name, 'Aaa');
});

it('export interface', () => {
    let code = `export interface Entry {}`;
    let [result] = parse(code);
    assert.equal(result.name, 'Entry');
});

it('export function', () => {
    let code = `export function dummy() {}`;
    let [result] = parse(code);
    assert.equal(result.name, 'dummy');
});

it('export several vars', () => {
    let code = `export {somevar, otherVar}`;
    let [result, other] = parse(code);
    assert.equal(result.name, 'somevar');
    assert.equal(other.name, 'otherVar');
});

it('export default', () => {
    let code = `export default function foo() {}`;
    var [entry] = parse(code);
    assert.equal(entry.name, 'foo');
    assert.equal(entry.isDefault, true);
});

it('empty source', () => {
    let code = ``;
    var result = parse(code);
    assert.deepEqual(result, []);
});

it('object binding', () => {
    let code = `export const {ModuleStore} = $traceurRuntime;`;
    let [result1] = parse(code);
    assert.equal(result1.name, 'ModuleStore');
});

it('should extract declared module http', () => {
    let source = `declare module "http" {
        export var METHODS: string[];
        export const c1, c2: any;
    }
    export var out1: number = 1;
    `;
    let result = parse(source);
    let out1 = result.find(e => e.name === 'out1');
    assert(out1);
    let httpEntries = result.filter(e => e.module === 'http');
    assert.equal(httpEntries.length, 3);
    assert.equal(httpEntries[0].name, 'METHODS');
    assert.equal(httpEntries[1].name, 'c1');
    assert.equal(httpEntries[2].name, 'c2');
});

it('should extract declared module events', () => {
    let source = `declare module "events" {
        class internal extends NodeJS.EventEmitter { }
        namespace internal {
            export class EventEmitter extends internal {
            }
        }
        export = internal;
    }`;
    let entries = parse(source);
    let event = entries.find(e => e.name === 'EventEmitter');
    assert(event);
    assert.equal(event.name, 'EventEmitter');
    assert.equal(event.module, 'events');
});

it('not too deep parse', () => {
    const source = `
    export function deep() {
        const x = {a: {c: {d: 1}}};
        return () => a => b => c => () => ({
            export = x;
        });
    };
}`;
    const result = parse(source);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'deep');
});

it('duplicates must be removed', () => {
    const source = `
    export function spawnSync(command: string): SpawnSyncReturns<Buffer>;
    export function spawnSync(command: string, options?: SpawnSyncOptionsWithStringEncoding): SpawnSyncReturns<string>;
`;
    const result = parse(source);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'spawnSync');
});

it('simulated commonjs', () => {
    const source = `
declare namespace e {
    interface Request extends core.Request { }
}
declare namespace d {
    declare const x = 1;
    function y() {}
}
export = e;
`;
    const result = parse(source);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'Request');
    assert.equal(result[0].cjs, true);
});
