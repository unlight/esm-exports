import test from "ava";
import { parseModule } from "./parse-module";
const pkgDir = require("pkg-dir");
var rootPath;

test.before(t => {
    rootPath = pkgDir.sync();
});

test("smoke", t => {
    t.truthy(parseModule);
});

test("angular2-calendar", t => {
    return parseModule("angular2-calendar", { dirname: rootPath }).then(result => {
        const calendarEventTitleEntry = result.find(item => item.name === 'CalendarEventTitle');
        t.is(calendarEventTitleEntry.module, 'angular2-calendar');
    });
});

test("ava module", t => {
    return parseModule("ava", { dirname: rootPath }).then(result => {
        // node_modules names should be uniq
        var names = result.map(item => item.name);
        var uniqNames = Array.from(new Set(names));
        t.is(uniqNames.length, names.length);
    });
});

test("rxjs module", t => {
    return parseModule("rxjs", { dirname: rootPath }).then(result => {
        // node_modules names should be uniq
        var names = result.map(item => item.name);
        var uniqNames = Array.from(new Set(names));
        t.is(uniqNames.length, names.length);
    });
});

test('gulp-tslint', async t => {
    const nodes = await parseModule('gulp-tslint', { dirname: rootPath });
    let falsyNodes = nodes.filter(v => !v);
    t.truthy(falsyNodes.length === 0);
    let pluginOptions = nodes.find(v => v.name === 'PluginOptions');
    t.truthy(pluginOptions);
    t.truthy(pluginOptions.module === 'gulp-tslint');
});

test('no falsy nodes', async t => {
    var nodes = await parseModule('@angular/core', {dirname: rootPath});
    var falsyNodes = nodes.filter(v => !v);
    t.truthy(falsyNodes.length === 0);
});
