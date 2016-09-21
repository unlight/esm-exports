"use strict";
/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
var path = require("path");
var fs = require("fs");
var parse_1 = require("./parse");
var lodash_1 = require("lodash");
var resolvePkg = require("resolve-pkg");
var readFile = require("fs-readfile-promise");
var unixify = require("unixify");
var isRelative = require("is-relative-path");
var defaults = {
    baseDir: "."
};
function node(nameOrFile, options) {
    if (options === void 0) { options = defaults; }
    var file;
    var baseDir = options.baseDir, parent = options.parent;
    var module = parent ? parent : nameOrFile;
    if (isRelative(nameOrFile)) {
        if (lodash_1.endsWith(nameOrFile, ".ts")) {
            nameOrFile = nameOrFile.slice(0, -3);
        }
        var checkExtensions = [".ts", ".d.ts"];
        for (var i = 0; i < checkExtensions.length; ++i) {
            var extFile = nameOrFile + checkExtensions[i];
            file = path.resolve(baseDir, extFile);
            if (fs.existsSync(file)) {
                break;
            }
        }
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
        return parse_1.parse(sourceText, o);
    });
}
exports.node = node;
//# sourceMappingURL=node.js.map