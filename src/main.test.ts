import test from "ava";
import {main} from "./";
const pkgDir = require("pkg-dir");
var rootPath;

test.before(t => {
    rootPath = pkgDir.sync();
});

test("smoke", t => {
    t.truthy(main);
});

test.skip("test case ava", t => {
    return main("ava", { baseDir: rootPath }).then(result => {
        console.log('--------');
        console.log(result);
        console.log('--------');
    });
});

test.skip("test case angular2-calendar", t => {
    return main("angular2-calendar", { baseDir: rootPath }).then(result => {
        console.log('--------');
        console.log(result);
        console.log('--------');
    });
});


test.skip("test case rxjs", t => {
    return main("rxjs", { baseDir: rootPath }).then(result => {
        console.log('--------');
        console.log(result);
        console.log('--------');
    });
});
