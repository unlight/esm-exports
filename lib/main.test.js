"use strict";
var ava_1 = require("ava");
var _1 = require("./");
var pkgDir = require("pkg-dir");
var rootPath;
ava_1.default.before(function (t) {
    rootPath = pkgDir.sync();
});
ava_1.default("smoke", function (t) {
    t.truthy(_1.main);
});
ava_1.default.skip("test case ava", function (t) {
    return _1.main("ava", { baseDir: rootPath }).then(function (result) {
        console.log('--------');
        console.log(result);
        console.log('--------');
    });
});
ava_1.default.skip("test case angular2-calendar", function (t) {
    return _1.main("angular2-calendar", { baseDir: rootPath }).then(function (result) {
        console.log('--------');
        console.log(result);
        console.log('--------');
    });
});
ava_1.default.skip("test case rxjs", function (t) {
    return _1.main("rxjs", { baseDir: rootPath }).then(function (result) {
        console.log('--------');
        console.log(result);
        console.log('--------');
    });
});
//# sourceMappingURL=main.test.js.map