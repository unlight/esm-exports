"use strict";
var main_1 = require("./main");
var lodash_1 = require("lodash");
var readFile = require("fs-readfile-promise");
var read = require("fs-readdir-recursive");
function directory(target) {
    var baseDir = target;
    var files = read(target, filterFiles);
    return Promise.all(files.map(function (file) {
        return main_1.default("./" + file, { baseDir: baseDir });
    }))
        .then(function (result) {
        return lodash_1.flatten(result);
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = directory;
function filterFiles(file) {
    var result = file[0] !== ".";
    return result;
}
//# sourceMappingURL=directory.js.map