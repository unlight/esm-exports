import * as assert from 'assert';
import { parseModule } from './parse-module';
const pkgDir = require('pkg-dir');
let rootPath;

before(() => {
    rootPath = pkgDir.sync();
});

it('smoke', () => {
    assert(parseModule);
});

it('angular2-calendar', () => {
    return parseModule('angular2-calendar', { dirname: rootPath }).then(result => {
        const calendarEventTitleEntry = result.find(item => item.name === 'CalendarEventTitle');
        assert.equal(calendarEventTitleEntry.module, 'angular2-calendar');
    });
});

it('rxjs module', () => {
    return parseModule('rxjs', { dirname: rootPath }).then(result => {
        // node_modules names should be uniq
        var names = result.map(item => item.name);
        var uniqNames = Array.from(new Set(names));
        assert.equal(uniqNames.length, names.length);
    });
});

it('gulp-tslint', async () => {
    const nodes = await parseModule('gulp-tslint', { dirname: rootPath });
    let falsyNodes = nodes.filter(v => !v);
    assert(falsyNodes.length === 0);
    let pluginOptions = nodes.find(v => v.name === 'PluginOptions');
    assert(pluginOptions);
    assert(pluginOptions.module === 'gulp-tslint');
});

it('no falsy nodes', async () => {
    var nodes = await parseModule('@angular/core', {dirname: rootPath});
    var falsyNodes = nodes.filter(v => !v);
    assert(falsyNodes.length === 0);
});

it('parseModule unknown module', async () => {
    const nodes = await parseModule('unknown_module_foo', { dirname: rootPath });
    assert(nodes.length === 0);
});
