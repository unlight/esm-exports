import test from "ava";
const pkgDir = require("pkg-dir");
const mock = require("mock-require");
var parse;

test.before(t => {
    mock("./node", {
        node: function(specifier, properties) {
            properties.__mainMock = true;
            return [properties];
        }
    });
    parse = require("./parse").default;
});

test("var export", async function(t) {
    var code = `export var aaa = 1`;
    var [result] = await parse(code);
    t.is(result.name, "aaa");
});

test("several var export", async function(t) {
    var code = `export var aaa, bbb`;
    var [result, result2] = await parse(code);
    t.is(result.name, "aaa");
    t.is(result2.name, "bbb");
});

test("export all", async function(t) {
    var code = `export * from './provider'`;
    var [result] = await parse(code);
    t.is(result.specifier, "./provider");
});

test("export some from module", async function(t) {
    var code = `export {var1} from './provider'`;
    var [result] = await parse(code);
    t.is(result.name, "var1");
    t.is(result.specifier, "./provider");
});

test("pick export", async function(t) { 
   var code = `export { CalendarEvent, EventAction } from 'calendar-utils'`;
   var [first, second] = await parse(code);
   t.is(first.name, "CalendarEvent");
   t.is(first.specifier, "calendar-utils");
   t.falsy(first.exportAll);
   t.is(second.name, "EventAction");
});

test("export declare class", async function(t) {
    var code = `export declare class Calendar`;
    var [result] = await parse(code);
    t.is(result.name, "Calendar");
});

test("export class", async function(t) {
    var code = `export class Aaa`;
    var [result] = await parse(code);
    t.is(result.name, "Aaa");
});

test("export interface", async function(t) {
    var code = `export interface Entry {}`;
    var [result] = await parse(code);
    t.is(result.name, "Entry");
});

test("export function", async function(t) {
    var code = `export function dummy() {}`;
    var [result] = await parse(code);
    t.is(result.name, "dummy");
});

test("export somevar", async function(t) {
    var code = `export {somevar, otherVar}`;
    var [result, other] = await parse(code);
    t.is(result.name, "somevar");
    t.falsy(result.exportAll);
    t.is(other.name, "otherVar");
    t.falsy(other.exportAll);
});


//# sourceMappingURL=parse.test.js.map