"use strict";
var ava_1 = require("ava");
var _1 = require("./");
var pkgDir = require("pkg-dir");
var rootPath;
ava_1.default.before(function (t) {
    rootPath = pkgDir.sync();
});
ava_1.default("smoke", function (t) {
    t.truthy(_1.node);
});
ava_1.default.skip("test case ava", function (t) {
    return _1.node("ava", { baseDir: rootPath }).then(function (result) {
        console.log('--------');
        console.log(result);
        console.log('--------');
    });
});
ava_1.default.skip("test case angular2-calendar", function (t) {
    return _1.node("angular2-calendar", { baseDir: rootPath }).then(function (result) {
        console.log('--------');
        console.log(result);
        console.log('--------');
    });
});
ava_1.default.skip("test case rxjs", function (t) {
    return _1.node("rxjs", { baseDir: rootPath }).then(function (result) {
        console.log('--------');
        console.log(result);
        console.log('--------');
    });
});
//# sourceMappingURL=node.test.js.map