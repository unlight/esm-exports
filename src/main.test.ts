import test from "ava";
import main from "./main";
const pkgDir = require('pkg-dir');
var rootPath;

test.before(t => {
	rootPath = pkgDir.sync();
});

test("smoke", t => {
	t.truthy(main);
});

test("test case", t => {
	return main("angular2-calendar", { baseDir: rootPath }).then(result => {
		console.log('--------');
		console.log(result);
		console.log('--------');
	});
});
