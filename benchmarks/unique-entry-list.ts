/// <reference path='../node_modules/@types/node/index.d.ts' />
/// <reference path='../node_modules/@types/benchmark/index.d.ts' />
/// <reference path='../node_modules/typescript/lib/lib.es2015.d.ts' />
import { Suite } from 'benchmark';
import * as _ from 'lodash';

const entryListCollection = [
	{ name: 'Hye', hash: '1' },
	{ name: 'Malvina', hash: '3' },
	{ name: 'Alex', hash: '9' },
	{ name: 'Manuela', hash: '1' },
	{ name: 'Yee', hash: '4' },
	{ name: 'Diann', hash: '3' },
	{ name: 'Helga', hash: '1' },
	{ name: 'Rowena', hash: '7' },
	{ name: 'Heather', hash: '4' },
	{ name: 'Tawanda', hash: '8' },
];

new Suite('unique entry list')
	.add('lodash chain', function() {
		_.chain(entryListCollection)
			.flatten()
			.uniqBy((entry: any) => JSON.stringify(entry.hash))
			.value();
	})
	.add('es6 set', function() {
		Array.from(new Set(entryListCollection));
	})
	.on('start', ({ currentTarget }) => {
		console.log(`${currentTarget.name} benchmark:`);
	})
	.on('cycle', function(event) {
		console.log(String(event.target));
	})
	.on('complete', ({ currentTarget }) => {
		console.log(`${currentTarget.filter('fastest').map('name')} is fastest`);
	})
	.run();