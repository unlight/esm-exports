/// <reference types="node" />
/// <reference types="benchmark" />

import { Suite } from 'benchmark';

const testObject = { name: 'Hye', id: 34 };
const n = 1;

new Suite('hash object')
	.add('stringify', function() {
		return JSON.stringify(testObject);
	})
	.add('concat', function() {
		return `${testObject.id}/${n ? testObject.name : testObject.id}`;
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