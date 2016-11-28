import test from "ava";
import { directory, node } from './';

test.skip('angular2-blank-project src', async t => {
	const files = await directory(`d:/My/Dev/angular2-blank-project`)
});

test.skip('angular2-blank-project deps', async t => {
	var nodes = await node('@angular/core', {baseDir: `d:/My/Dev/angular2-blank-project`});
});
