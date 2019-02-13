import * as assert from 'assert';
import { directory } from './directory';
import { normalize } from 'path';
const pkgDir = require('pkg-dir');
const rootPath = pkgDir.sync();

const missingName = 'all entries must have name';

it('directory smoke test', () => {
    assert(directory);
});

it('should parse directory', async () => {
    const result = await directory(`${rootPath}/src`);
    assert(result.filter(m => !m.name).length === 0, missingName);
    assert(result.length > 0);
    const [parse] = result.filter(value => value.name === 'parse');
    assert(parse);
    assert.equal(normalize(parse.filepath), normalize(`${rootPath}/src/index.ts`));
});

it('directory target null', async () => {
    await directory(undefined)
        .catch(assert);
});

it('not existing target', async () => {
    await directory(`${rootPath}/foo`)
        .catch(assert);
});

it('relative target', async () => {
    const result = await directory('src');
    assert(result.filter(m => !m.name).length === 0, missingName);
    assert.notEqual(result.length, 0);
});

it('should ignore node_modules', async () => {
    const result = await directory(`${rootPath}`);
    assert(result.filter(m => !m.name).length === 0, missingName);
    const ts = result.filter(item => item.module === 'typescript');
    assert.equal(ts.length, 0);
    const nodeModules = result.filter(item => item.filepath && item.filepath.indexOf('node_modules') !== -1);
    assert.equal(nodeModules.length, 0);
});
