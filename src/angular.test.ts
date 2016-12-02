import test from "ava";
import { directory, node } from './';
const pkgDir = require("pkg-dir");
var rootPath;

test.before(t => {
    rootPath = pkgDir.sync();
});

test('no falsy nodes', async t => {
	var nodes = await node('@angular/core', {baseDir: rootPath});
	var falsyNodes = nodes.filter(v => !v);
	t.truthy(falsyNodes.length === 0);
});
