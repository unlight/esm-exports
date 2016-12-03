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

test.skip("test case ava", t => {
    return node("ava", { baseDir: rootPath }).then(result => {
        console.log('--------');
        console.log(result);
        console.log('--------');
    });
});

test.skip("test case rxjs", t => {
    return node("rxjs", { baseDir: rootPath }).then(result => {
        console.log('--------');
        console.log(result);
        console.log('--------');
    });
});
