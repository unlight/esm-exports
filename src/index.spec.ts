/* eslint-disable @typescript-eslint/tslint/config */
import * as assert from 'assert';
import { main } from './index';

it('smoke test', () => {
    assert(main);
});

it('var export', () => {
    const [result] = main(`export var test = 1`);
    assert(result.name === 'test');
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

// it('export default var', () => {
//     const code = `export default component`;
//     const [entry] = main(code);
//     assert(entry);
//     assert.equal(entry.name, 'component');
//     assert.equal(entry.isDefault, true);
// });

// it('export default', () => {
//     const code = `export default function foo() {}`;
//     const [entry] = parse(code);
//     assert.equal(entry.name, 'foo');
//     assert.equal(entry.isDefault, true);
// });
