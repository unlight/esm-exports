"use strict";
/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
var path = require("path");
var parse_1 = require("./parse");
var resolvePkg = require('resolve-pkg');
var readFile = require("fs-readfile-promise");
var unixify = require("unixify");
var isRelative = require("is-relative-path");
var defaults = {
    baseDir: "."
};
function main(nameOrFile, options) {
    if (options === void 0) { options = defaults; }
    var file;
    var baseDir = options.baseDir, parent = options.parent;
    var module = parent ? parent : nameOrFile;
    if (isRelative(nameOrFile)) {
        var extFile = nameOrFile + ".d.ts";
        file = path.resolve(baseDir, extFile);
    }
    else {
        var packageDir = resolvePkg(nameOrFile, { cwd: baseDir });
        var packageFile = path.join(packageDir, "package.json");
        var typings = require(packageFile).typings;
        if (!typings) {
            return Promise.resolve([]);
        }
        file = path.join(packageDir, typings);
    }
    var dirname = path.dirname(file);
    dirname = unixify(dirname);
    return readFile(file, "utf8")
        .then(function (sourceText) {
        var o = Object.assign({}, options, { module: module, file: file, dirname: dirname });
        return parse_1.default(sourceText, o);
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = main;

//# sourceMappingURL=main.js.map