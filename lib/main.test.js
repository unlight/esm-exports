"use strict";
var ava_1 = require("ava");
var main_1 = require("./main");
var pkgDir = require("pkg-dir");
var rootPath;
ava_1.default.before(function (t) {
    rootPath = pkgDir.sync();
});
ava_1.default("smoke", function (t) {
    t.truthy(main_1.default);
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
//# sourceMappingURL=main.test.js.map