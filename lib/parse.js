"use strict";
/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
var ts = require("typescript");
var path = require("path");
var lodash_1 = require("lodash");
var main_1 = require("./main");
var isRelative = require("is-relative-path");
var unixify = require("unixify");
function parse(sourceText, options) {
    var entryList = [];
    var sourceFile = ts.createSourceFile("dummy.ts", sourceText, ts.ScriptTarget.ES6, false);
    var dirname = options.dirname, module = options.module, file = options.file;
    sourceFile.statements.forEach(function (node) {
        if (node.kind === ts.SyntaxKind.ExportDeclaration) {
            var specifier = node.moduleSpecifier.text;
            var exportAll = true;
            var names = [null];
            if (node.exportClause) {
                names = node.exportClause.elements.map(function (n) { return n.name.text; });
            }
            names.forEach(function (name) { return entryList.push({ name: name, specifier: specifier, exportAll: exportAll, dirname: dirname }); });
        }
        else if (lodash_1.find(node.modifiers, function (m) { return m.kind === ts.SyntaxKind.ExportKeyword; })) {
            // TODO: Combine ifs later.
            if (node.declarationList) {
                node.declarationList.declarations.forEach(function (d) {
                    var name = d.name.text;
                    entryList.push({ name: name, module: module });
                });
            }
            else if (node.name) {
                var name = node.name.text;
                var specifier = options.specifier, baseDir = options.baseDir;
                if (specifier && isRelative(specifier)) {
                    var relative = unixify(path.relative(baseDir, file));
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
        return main_1.default(item.specifier, { baseDir: dirname, parent: module, specifier: item.specifier });
    }))
        .then(function (result) {
        return lodash_1.flatten(result);
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = parse;

//# sourceMappingURL=parse.js.map