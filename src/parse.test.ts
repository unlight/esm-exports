import test from "ava";
const pkgDir = require('pkg-dir');
var mock = require('mock-require');
var rootPath;
var parse;
var code;

test.before(t => {
    mock('fs-readfile-promise', function(file) {
        return Promise.resolve(code);
    });
    parse = require("./parse").default;
});

test("var export", async function(t) {
    code = `export var aaa = 1`;
    var [result] = await parse("code");
    t.is(result.name, "aaa");
});

test("several var export", async function(t) {
    code = `export var aaa, bbb`;
    var [result, result2] = await parse("code");
    t.is(result.name, "aaa");
    t.is(result2.name, "bbb");
});

test.only("export all", async function(t) {
    code = `export * from './provider'`;
    var [result] = await parse("code");
    t.is(result.exportAll, true);
    t.is(result.module, "./provider");
});

test("export some from module", async function(t) {
    code = `export {var1} from './provider'`;
    var [result] = await parse("code");
    t.is(result.name, "var1");
    t.is(result.module, "./provider");
});

test("pick export", async function(t) { 
   code = `export { CalendarEvent, EventAction } from 'calendar-utils'`;
   var [first, second] = await parse("code");
   t.is(first.name, "CalendarEvent");
   t.is(first.module, "calendar-utils");
   t.is(second.name, "EventAction");
});

test("export declare class", async function(t) {
    code = `export declare class Calendar`;
    var [result] = await parse("code");
    t.is(result.name, "Calendar");
});

test("export class", async function(t) {
    code = `export class Aaa`;
    var [result] = await parse("code");
    t.is(result.name, "Aaa");
});

test("export interface", async function(t) {
    code = `export interface Entry {}`;
    var [result] = await parse("code");
    t.is(result.name, "Entry");
});

test("export function", async function(t) {
    code = `export function dummy() {}`;
    var [result] = await parse("code");
    t.is(result.name, "dummy");
});

test("export somevar", async function(t) {
    code = `export {somevar, otherVar}`;
    var [result, other] = await parse("code");
    t.is(result.name, "somevar");
    t.is(other.name, "otherVar");
});

