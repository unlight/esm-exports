import * as assert from 'assert';
import { Entry } from './entry';
import { module as parse } from './module';
const pkgDir = require('pkg-dir');
const rootPath = pkgDir.sync();

it('parse module smoke', () => {
    assert(parse);
});

it('angular2-calendar', async function() {
    const result = await parse('angular2-calendar', { basedir: rootPath });
    const [first] = result;
    assert.equal(first.module, 'angular2-calendar');
    const calendarEventTitleEntry = result.find(item => item.name === 'CalendarEventTitle');
    assert(calendarEventTitleEntry);
    assert.equal(calendarEventTitleEntry.module, 'angular2-calendar');
});

it.skip('rxjs module, node_modules names should be uniq', async () => {
    const result = await parse('rxjs', { basedir: rootPath });
    const names = result.map(item => item.name);
    const uniqNames: string[] = Array.from(new Set(names));
    assert.equal(uniqNames.length, names.length);
});

it('gulp-tslint', async () => {
    const nodes = await parse('gulp-tslint', { basedir: rootPath });
    const falsyNodes = nodes.filter(v => !v);
    assert(falsyNodes.length === 0);
    const pluginOptions = nodes.find(v => v.name === 'PluginOptions');
    assert(pluginOptions);
    assert(pluginOptions.module === 'gulp-tslint');
});

it('no falsy nodes', async () => {
    const nodes = await parse('@angular/core', { basedir: rootPath });
    const falsyNodes = nodes.filter(v => !v);
    assert(falsyNodes.length === 0);
});

it('parse unknown module', async () => {
    const nodes = await parse('unknown_module_foo', { basedir: rootPath });
    assert(nodes.length === 0);
});

it('inner module', async () => {
    const nodes = await parse('@angular/core/testing', { basedir: rootPath });
    const inject = nodes.find(n => n.name === 'inject');
    assert(inject);
    const TestBed = nodes.find(n => n.name === 'TestBed');
    assert(TestBed);
});

it('should find inner module properly', async () => {
    const nodes = await parse('@angular/core', { basedir: rootPath });
    const testing = nodes.filter(n => n.module === '@angular/core/testing');
    assert(testing.length);
    const inject = nodes.filter(n => n.name === 'inject');
    assert.notEqual(inject.length, 0);
});

it('should not contain duplicated entries (modules)', async () => {
    const nodes = await parse('@angular/core', { basedir: rootPath });
    const inject = nodes.filter(n => n.name === 'inject');
    assert.equal(inject.length, 1);
    const TestBed = nodes.filter(n => n.name === 'TestBed');
    assert.equal(TestBed.length, 1);
});

it('types node', async () => {
    const nodes = await parse('@types/node', { basedir: rootPath });
    const buffer = nodes.filter(m => m.module === 'buffer');
    const events = nodes.filter(m => m.module === 'events');
    assert(events.length > 0);
    assert(buffer.length > 0);
});

it('globals should be eliminated', async () => {
    const nodes = await parse('@types/node', { basedir: rootPath });
    const bastards = nodes.filter(m => m.module === '@types/node');
    assert.equal(bastards.length, 0);
});
