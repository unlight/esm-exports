"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var ava_1 = require("ava");
var pkgDir = require("pkg-dir");
var mock = require("mock-require");
var parse;
ava_1.default.before(function (t) {
    mock("./main", {
        default: function (specifier, properties) {
            properties.__mainMock = true;
            return [properties];
        }
    });
    parse = require("./parse").default;
});
ava_1.default("var export", function (t) {
    return __awaiter(this, void 0, void 0, function* () {
        var code = "export var aaa = 1";
        var result = (yield parse(code))[0];
        t.is(result.name, "aaa");
    });
});
ava_1.default("several var export", function (t) {
    return __awaiter(this, void 0, void 0, function* () {
        var code = "export var aaa, bbb";
        var _a = yield parse(code), result = _a[0], result2 = _a[1];
        t.is(result.name, "aaa");
        t.is(result2.name, "bbb");
    });
});
ava_1.default("export all", function (t) {
    return __awaiter(this, void 0, void 0, function* () {
        var code = "export * from './provider'";
        var result = (yield parse(code))[0];
        t.is(result.specifier, "./provider");
    });
});
ava_1.default("export some from module", function (t) {
    return __awaiter(this, void 0, void 0, function* () {
        var code = "export {var1} from './provider'";
        var result = (yield parse(code))[0];
        t.is(result.name, "var1");
        t.is(result.specifier, "./provider");
    });
});
ava_1.default("pick export", function (t) {
    return __awaiter(this, void 0, void 0, function* () {
        var code = "export { CalendarEvent, EventAction } from 'calendar-utils'";
        var _a = yield parse(code), first = _a[0], second = _a[1];
        t.is(first.name, "CalendarEvent");
        t.is(first.specifier, "calendar-utils");
        t.falsy(first.exportAll);
        t.is(second.name, "EventAction");
    });
});
ava_1.default("export declare class", function (t) {
    return __awaiter(this, void 0, void 0, function* () {
        var code = "export declare class Calendar";
        var result = (yield parse(code))[0];
        t.is(result.name, "Calendar");
    });
});
ava_1.default("export class", function (t) {
    return __awaiter(this, void 0, void 0, function* () {
        var code = "export class Aaa";
        var result = (yield parse(code))[0];
        t.is(result.name, "Aaa");
    });
});
ava_1.default("export interface", function (t) {
    return __awaiter(this, void 0, void 0, function* () {
        var code = "export interface Entry {}";
        var result = (yield parse(code))[0];
        t.is(result.name, "Entry");
    });
});
ava_1.default("export function", function (t) {
    return __awaiter(this, void 0, void 0, function* () {
        var code = "export function dummy() {}";
        var result = (yield parse(code))[0];
        t.is(result.name, "dummy");
    });
});
ava_1.default("export somevar", function (t) {
    return __awaiter(this, void 0, void 0, function* () {
        var code = "export {somevar, otherVar}";
        var _a = yield parse(code), result = _a[0], other = _a[1];
        t.is(result.name, "somevar");
        t.falsy(result.exportAll);
        t.is(other.name, "otherVar");
        t.falsy(other.exportAll);
    });
});
//# sourceMappingURL=parse.test.js.map