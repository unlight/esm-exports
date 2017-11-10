import * as assert from 'assert';
import { directory } from './directory';
const pkgDir = require('pkg-dir');
const rootPath = pkgDir.sync();

it('directory smoke test', () => {
    assert(directory);
});

it('should parse directory', async () => {
    const result = await directory(`${rootPath}/src`);
    assert(result.length > 0);
    const parse = result.filter(value => value.name === 'parse');
    assert(parse);
});

it('directory target null', async () => {
    await directory(null)
        .catch(err => assert(err));
});

it('not existing target', async () => {
    const result = await directory(`${rootPath}/foo`)
        .catch(err => assert(err));
});

it('relative target', async () => {
    const result = await directory('src');
    assert.notEqual(result.length, 0);
});
