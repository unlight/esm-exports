import * as assert from 'assert';
import { parse } from '.';

it('smoke test', () => {
    assert(parse);
});

it.only('var export', () => {
    const [result] = parse(`export var test = 1`);
    assert(result.name === 'test');
});

it('declare module', () => {
    const result = parse(`
    declare module "fs" {
        namespace access {
            foo();
        }
        function readFile();
    }
    `);
});
