/// <reference types="node" />
/// <reference types="mocha" />
import { parseDefinitions } from './parse-definitions';
import * as assert from 'assert';

it('should extract declared module http', async () => {
    let source = `declare module "http" {
        export var METHODS: string[];
        export const c1, c2: any;
    }
    export var out1: number = 1;
    `;
    let entries = await parseDefinitions(source);
    let out1 = entries.find(e => e.name === 'out1');
    assert.ifError(out1);
    let httpEntries = entries.filter(e => e.module === 'http');
    assert.equal(httpEntries.length, 3);
});

it('should extract declared module events', async () => {
    let source = `declare module "events" {
        class internal extends NodeJS.EventEmitter { }
        namespace internal {
            export class EventEmitter extends internal {
            }
        }
        export = internal;
    }`;
    let entries = await parseDefinitions(source);
    let EventEmitter = entries.find(e => e.name === 'EventEmitter');
    assert(EventEmitter);
    assert.equal(EventEmitter.name, 'EventEmitter');
    assert.equal(EventEmitter.module, 'events');
});
