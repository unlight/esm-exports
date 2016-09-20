"use strict";
var path = require("path");
var _1 = require("./");
var lodash_1 = require("lodash");
var readFile = require("fs-readfile-promise");
var recursive = require("recursive-readdir");
var unixify = require("unixify");
function directory(target) {
    var baseDir = target;
    return new Promise(function (resolve, reject) {
        var files = recursive(target, [ignore], function (err, files) {
            if (err)
                return reject(err);
            resolve(files);
        });
    }).then(function (files) {
        return Promise.all(files.map(function (file) {
            file = path.relative(baseDir, file);
            file = unixify(file);
            return _1.node("./" + file, { baseDir: baseDir });
        }))
            .then(function (result) {
            return lodash_1.flatten(result);
        });
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = directory;
function ignore(file, stats) {
    if (stats.isDirectory())
        return false;
    if (lodash_1.endsWith(path.extname(file), ".ts"))
        return false;
    return true;
}
//# sourceMappingURL=directory.js.map