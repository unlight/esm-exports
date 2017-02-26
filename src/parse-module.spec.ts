/// <reference path="spec.reference.d.ts" />
import * as assert from 'assert';
import { parseModule } from './parse-module';
import { Entry } from './entry';
const pkgDir = require('pkg-dir');
const rootPath = pkgDir.sync();
import * as _ from 'lodash';
import { uniqEntryList } from './utils';

it('parse module smoke', () => {
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

it('should find inner module properly', async () => {
    const nodes = await parseModule('@angular/core', { dirname: rootPath });
    let testing = nodes.filter(n => n.module === '@angular/core/testing');
    assert(testing);
    let inject = nodes.filter(n => n.name === 'inject');
    assert(inject.length > 0);
});

it('should not contain duplicated entries (modules)', async () => {
    const nodes = await parseModule('@angular/core', { dirname: rootPath });
    let inject = nodes.filter(n => n.name === 'inject');
    assert.equal(inject.length, 1);
});

it('should not contain duplicated entries (src)', () => {
    let entries = [
        new Entry({name: 'name1', filepath: '/directory/file1'} as any),
        new Entry({name: 'name1', filepath: '/directory/file1'} as any),
    ]
    entries = uniqEntryList(entries);
    assert.equal(entries.length, 1);
});

it('types node', async () => {
    const nodes = await parseModule('@types/node', { dirname: rootPath });
    const buffer = nodes.filter(m => m.module === 'buffer');
    const events = nodes.filter(m => m.module === 'events');
    assert(events.length > 0);
    assert(buffer.length > 0);
});

it('globals should be eliminated', async () => {
    const nodes = await parseModule('@types/node', { dirname: rootPath });
    const bastards = nodes.filter(m => m.module === '@types/node');
    assert.equal(bastards.length, 0);
});

