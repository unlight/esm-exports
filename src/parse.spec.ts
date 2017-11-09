import * as assert from 'assert';
import { parse } from './parse';

it('smoke test', () => {
    assert(parse);
});

it('var export', async function() {
    let code = `export var aaa = 1`;
    let [result] = await parse(code);
    debugger
    assert.equal(result.name, 'aaa');
});

it('several var export', async function() {
    let code = `export var aaa, bbb`;
    let [result, result2] = await parse(code);
    assert.equal(result.name, 'aaa');
    assert.equal(result2.name, 'bbb');
});

it('export all', async function() {
    let code = `export * from './provider'`;
    let [result] = await parse(code);
    assert.equal(result.specifier, './provider');
});

it('export some from module', async function() {
    let code = `export {var1} from './provider'`;
    let [result] = await parse(code);
    assert.equal(result.name, 'var1');
    assert.equal(result.specifier, './provider');
});

it('pick export', async function() {
    let code = `export { CalendarEvent, EventAction } from 'calendar-utils'`;
    var [first, second] = await parse(code);
    assert.equal(first.name, 'CalendarEvent');
    assert.equal(first.specifier, 'calendar-utils');
    assert.equal(second.name, 'EventAction');
});

it('export declare class', async function() {
    let code = `export declare class Calendar`;
    let [result] = await parse(code);
    assert.equal(result.name, 'Calendar');
});

it('export class', async function() {
    let code = `export class Aaa`;
    let [result] = await parse(code);
    assert.equal(result.name, 'Aaa');
});

it('export interface', async function() {
    let code = `export interface Entry {}`;
    let [result] = await parse(code);
    assert.equal(result.name, 'Entry');
});

it('export function', async function() {
    let code = `export function dummy() {}`;
    let [result] = await parse(code);
    assert.equal(result.name, 'dummy');
});

it('export several vars', async function() {
    let code = `export {somevar, otherVar}`;
    let [result, other] = await parse(code);
    assert.equal(result.name, 'somevar');
    assert.equal(other.name, 'otherVar');
});

it('export default', async function() {
    let code = `export default function foo() {}`;
    var [entry] = await parse(code);
    assert.equal(entry.name, 'foo');
    assert.equal(entry.isDefault, true);
});

it('empty source', async () => {
    let code = ``;
    var result = await parse(code);
    assert.deepEqual(result, []);
});

it('object binding', async () => {
    let code = `export const {ModuleStore} = $traceurRuntime;`;
    let [result1] = await parse(code);
    assert.equal(result1.name, 'ModuleStore');
});

it('should extract declared module http', async () => {
    let source = `declare module "http" {
        export var METHODS: string[];
        export const c1, c2: any;
    }
    export var out1: number = 1;
    `;
    let entries = await parse(source);
    let out1 = entries.find(e => e.name === 'out1');
    assert(out1);
    let httpEntries = entries.filter(e => e.module === 'http');
    assert.equal(httpEntries.length, 3);
    assert.equal(httpEntries[0].name, 'METHODS');
    assert.equal(httpEntries[1].name, 'c1');
    assert.equal(httpEntries[2].name, 'c2');
});

it('should extract declared module events', async () => {
    let source = `declare module "events" {
        class internal extends NodeJS.EventEmitter { }
        namespace internal {
            export class EventEmitter extends internal {
            }
        }
        export = internal;
    }`;
    let entries = await parse(source);
    let event = entries.find(e => e.name === 'EventEmitter');
    assert(event);
    assert.equal(event.name, 'EventEmitter');
    assert.equal(event.module, 'events');
});

// TODO: How it should behave?
it.skip('declare namespace', async () => {
    let source = `
        declare namespace through2 {
        }
        export = through2
    `;
    let [entry] = await parse(source);
    assert.equal(entry.module, 'through2');
    assert.equal(entry.isDefault, true);
});
