import { parse } from './index';
import * as assert from 'assert';

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

// it.skip('export as namespace', () => {
//     const source = `
//         export = _;
//         export as namespace _;
//     `;
//     const result = parse(source);
// });
