"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var ava_1 = require("ava");
var pkgDir = require("pkg-dir");
var mock = require("mock-require");
var parse;
ava_1.default.before(function (t) {
    mock("./node", {
        node: function (specifier, properties) {
            properties.__mainMock = true;
            return [properties];
        }
    });
    parse = require("./").parse;
});
ava_1.default("var export", function (t) {
    return __awaiter(this, void 0, void 0, function () {
        var code, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    code = "export var aaa = 1";
                    return [4 /*yield*/, parse(code)];
                case 1:
                    result = (_a.sent())[0];
                    t.is(result.name, "aaa");
                    return [2 /*return*/];
            }
        });
    });
});
ava_1.default("several var export", function (t) {
    return __awaiter(this, void 0, void 0, function () {
        var code, _a, result, result2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    code = "export var aaa, bbb";
                    return [4 /*yield*/, parse(code)];
                case 1:
                    _a = _b.sent(), result = _a[0], result2 = _a[1];
                    t.is(result.name, "aaa");
                    t.is(result2.name, "bbb");
                    return [2 /*return*/];
            }
        });
    });
});
ava_1.default("export all", function (t) {
    return __awaiter(this, void 0, void 0, function () {
        var code, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    code = "export * from './provider'";
                    return [4 /*yield*/, parse(code)];
                case 1:
                    result = (_a.sent())[0];
                    t.is(result.specifier, "./provider");
                    return [2 /*return*/];
            }
        });
    });
});
ava_1.default("export some from module", function (t) {
    return __awaiter(this, void 0, void 0, function () {
        var code, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    code = "export {var1} from './provider'";
                    return [4 /*yield*/, parse(code)];
                case 1:
                    result = (_a.sent())[0];
                    t.is(result.name, "var1");
                    t.is(result.specifier, "./provider");
                    return [2 /*return*/];
            }
        });
    });
});
ava_1.default("pick export", function (t) {
    return __awaiter(this, void 0, void 0, function () {
        var code, _a, first, second;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    code = "export { CalendarEvent, EventAction } from 'calendar-utils'";
                    return [4 /*yield*/, parse(code)];
                case 1:
                    _a = _b.sent(), first = _a[0], second = _a[1];
                    t.is(first.name, "CalendarEvent");
                    t.is(first.specifier, "calendar-utils");
                    t.falsy(first.exportAll);
                    t.is(second.name, "EventAction");
                    return [2 /*return*/];
            }
        });
    });
});
ava_1.default("export declare class", function (t) {
    return __awaiter(this, void 0, void 0, function () {
        var code, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    code = "export declare class Calendar";
                    return [4 /*yield*/, parse(code)];
                case 1:
                    result = (_a.sent())[0];
                    t.is(result.name, "Calendar");
                    return [2 /*return*/];
            }
        });
    });
});
ava_1.default("export class", function (t) {
    return __awaiter(this, void 0, void 0, function () {
        var code, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    code = "export class Aaa";
                    return [4 /*yield*/, parse(code)];
                case 1:
                    result = (_a.sent())[0];
                    t.is(result.name, "Aaa");
                    return [2 /*return*/];
            }
        });
    });
});
ava_1.default("export interface", function (t) {
    return __awaiter(this, void 0, void 0, function () {
        var code, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    code = "export interface Entry {}";
                    return [4 /*yield*/, parse(code)];
                case 1:
                    result = (_a.sent())[0];
                    t.is(result.name, "Entry");
                    return [2 /*return*/];
            }
        });
    });
});
ava_1.default("export function", function (t) {
    return __awaiter(this, void 0, void 0, function () {
        var code, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    code = "export function dummy() {}";
                    return [4 /*yield*/, parse(code)];
                case 1:
                    result = (_a.sent())[0];
                    t.is(result.name, "dummy");
                    return [2 /*return*/];
            }
        });
    });
});
ava_1.default("export somevar", function (t) {
    return __awaiter(this, void 0, void 0, function () {
        var code, _a, result, other;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    code = "export {somevar, otherVar}";
                    return [4 /*yield*/, parse(code)];
                case 1:
                    _a = _b.sent(), result = _a[0], other = _a[1];
                    t.is(result.name, "somevar");
                    t.falsy(result.exportAll);
                    t.is(other.name, "otherVar");
                    t.falsy(other.exportAll);
                    return [2 /*return*/];
            }
        });
    });
});
//# sourceMappingURL=parse.test.js.map