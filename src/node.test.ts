import test from "ava";
import { node } from "./";
const pkgDir = require("pkg-dir");
var rootPath;

test.before(t => {
    rootPath = pkgDir.sync();
});

test("smoke", t => {
    t.truthy(node);
});

test("angular2-calendar", t => {
    return node("angular2-calendar", { baseDir: rootPath }).then(result => {
        const calendarEventTitleEntry = result.find(item => item.name === 'CalendarEventTitle');
        t.is(calendarEventTitleEntry.module, 'angular2-calendar');
    });
});

test("ava module", t => {
    return node("ava", { baseDir: rootPath }).then(result => {
        // node_modules names should be uniq
        var names = result.map(item => item.name);
        var uniqNames = Array.from(new Set(names));
        t.is(uniqNames.length, names.length);
    });
});

test("rxjs module", t => {
    return node("rxjs", { baseDir: rootPath }).then(result => {
        // node_modules names should be uniq
        var names = result.map(item => item.name);
        var uniqNames = Array.from(new Set(names));
        t.is(uniqNames.length, names.length);
    });
});
