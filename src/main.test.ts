import test from "ava";
import main from "./main";
const pkgDir = require("pkg-dir");
var rootPath;

test.before(t => {
    rootPath = pkgDir.sync();
});

test("smoke", t => {
    t.truthy(main);
});

// test("test case ava", t => {
//     return main("ava", { baseDir: rootPath }).then(result => {
//         console.log('--------');
//         console.log(result);
//         console.log('--------');
//     });
// });

// test("test case angular2-calendar", t => {
//     return main("angular2-calendar", { baseDir: rootPath }).then(result => {
//         console.log('--------');
//         console.log(result);
//         console.log('--------');
//     });
// });
