"use strict";
/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
var ts = require("typescript");
var path = require("path");
var lodash_1 = require("lodash");
var _1 = require("./");
var isRelative = require("is-relative-path");
var unixify = require("unixify");
function parse(sourceText, options) {
    if (options === void 0) { options = {}; }
    var entryList = [];
    var sourceFile = ts.createSourceFile("dummy.ts", sourceText, ts.ScriptTarget.ES6, false);
    var dirname = options.dirname, module = options.module, file = options.file;
    if (module) {
        module = unixify(module);
    }
    sourceFile.statements.forEach(function (statement) {
        if (statement.kind === ts.SyntaxKind.ExportDeclaration) {
            var specifier = lodash_1.get(statement, "moduleSpecifier.text", null);
            var exportAll = !(statement.exportClause && statement.exportClause.elements);
            if (exportAll) {
                var names = [null];
            }
            if (statement.exportClause) {
                names = statement.exportClause.elements.map(function (n) { return n.name.text; });
            }
            names.forEach(function (name) { return entryList.push({ name: name, module: module, specifier: specifier, exportAll: exportAll, dirname: dirname }); });
        }
        else if (lodash_1.find(statement.modifiers, function (m) { return m.kind === ts.SyntaxKind.ExportKeyword; })) {
            // TODO: Combine ifs later.
            if (statement.declarationList) {
                statement.declarationList.declarations.forEach(function (d) {
                    var name = d.name.text;
                    entryList.push({ name: name, module: module });
                });
            }
            else if (statement.name) {
                var name = statement.name.text;
                var string = options.specifier, baseDir = options.baseDir;
                if (specifier && isRelative(specifier)) {
                    var relative = unixify(path.relative(baseDir, file));
                    // TODO: strip ts or dts extension
                    var exact = module + "/" + relative.slice(0, -(".d.ts".length));
                }
                entryList.push({ name: name, module: module, relative: relative, exact: exact, specifier: specifier });
            }
        }
    });
    return Promise.all(entryList.map(function (item) {
        if (!item.exportAll) {
            return item;
        }
        return _1.node(item.specifier, { baseDir: dirname, parent: module, specifier: item.specifier });
    }))
        .then(function (result) {
        return lodash_1.flatten(result);
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = parse;

//# sourceMappingURL=parse.js.map