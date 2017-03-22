import * as assert from 'assert';
import { directory } from './directory';
import filter = require('lodash/filter');
const pkgDir = require('pkg-dir');
const rootPath = pkgDir.sync();

it('directory smoke test', () => {
	assert(directory);
});

it('should parse directory', () => {
	return directory(rootPath + '/src')
		.then(result => {
			var [parse] = filter(result, item => item.name === 'parse');
			assert(parse);
		});
});

it('directory target null', () => {
	return directory(null).catch(err => {
		assert(err);
	});
});

it('not existing target', async () => {
	return directory(rootPath + '/foo')
		.catch(err => {
			assert(err);
		})
});
