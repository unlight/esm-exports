/// <reference types="node" />
/// <reference types="mocha" />

import * as assert from 'assert';
import { parse, parseDefinitions } from './parse';

it('smoke test', () => {
    assert(parse);
});

it('var export', async function() {
    let code = `export var aaa = 1`;
    let [result] = await parse(code);
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

it.skip('declare namespace isDefault', async () => {
    let source = `
        declare namespace through2 {
        }
        export = through2
    `;
    let [entry] = await parse(source);
    assert.equal(entry.module, 'through2');
    assert.equal(entry.isDefault, true);
});