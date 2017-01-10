import test from "ava";
import { directory } from "./directory";
import { filter } from "lodash";
const pkgDir = require("pkg-dir");
var rootPath;

test.before(t => {
	rootPath = pkgDir.sync();
});

test("smoke", t => {
	t.truthy(directory);
});

test("should parse directory", t => {
	return directory(rootPath + "/src")
		.then(result => {
			var [parse] = filter(result, item => item.name === "parse");
			t.truthy(parse);
		});
});

test('directory target null', t => {
	return directory(null).catch(err => {
		t.truthy(err);
	});
});

test('not existing target', async t => {
	return directory(rootPath + "/foo")
		.catch(err => {
			t.truthy(err);
		})
});

test('angular2-blank-project src', async t => {
    const files = await directory(`../angular2-blank-project`);
    let appModuleInfo = files.find(e => e.name === 'AppModule');
    t.is(appModuleInfo.name, 'AppModule');
    t.truthy(appModuleInfo.filepath);
});
