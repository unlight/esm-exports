import test from "ava";
import { directory, node } from './';
const pkgDir = require("pkg-dir");
var rootPath;

test.before(t => {
	rootPath = pkgDir.sync();
});

test('angular2-blank-project src', async t => {
	const files = await directory(`d:/My/Dev/angular2-blank-project`);
	var [appModuleInfo] = files;
	t.is(appModuleInfo.name, 'AppModule');
	t.is(appModuleInfo.module, './src/app/app.module.ts');
});

test('gulp-tslint', async t => {
	const nodes = await node('gulp-tslint', { baseDir: rootPath });
	let falsyNodes = nodes.filter(v => !v);
	t.truthy(falsyNodes.length === 0);
	let pluginOptions = nodes.find(v => v.name === 'PluginOptions');
	t.truthy(pluginOptions);
	t.truthy(pluginOptions.module === 'gulp-tslint');
});
