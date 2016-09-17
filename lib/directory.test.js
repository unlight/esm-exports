"use strict";
var ava_1 = require("ava");
var directory_1 = require("./directory");
var lodash_1 = require("lodash");
var pkgDir = require("pkg-dir");
var rootPath;
ava_1.default.before(function (t) {
    rootPath = pkgDir.sync();
});
ava_1.default("smoke", function (t) {
    t.truthy(directory_1.default);
});
ava_1.default("should parse directory", function (t) {
    return directory_1.default(rootPath + "/src")
        .then(function (result) {
        var parse = lodash_1.filter(result, function (item) { return item.name === "parse"; })[0];
        t.truthy(parse);
    });
});
ava_1.default("should parse directory", function (t) {
    return directory_1.default(rootPath + "/src")
        .then(function (result) {
        // console.log('result', result);
    });
});
//# sourceMappingURL=directory.test.js.map