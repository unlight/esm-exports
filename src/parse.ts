/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
import * as ts from "typescript";
import * as path from "path";
import {find, flatten} from "lodash";
import main from "./main";
const readFile = require("fs-readfile-promise");
const unixify = require("unixify");
const isRelative = require('is-relative-path');

export default function parse(file: string) {
    var dirname = path.dirname(path.resolve(file));
    dirname = unixify(dirname);
    return readFile(file, "utf8")
        .then((sourceText: string) => {
            var result = [];
            var sourceFile = ts.createSourceFile("dummy.ts", sourceText, ts.ScriptTarget.ES6, false);
            sourceFile.statements.forEach((node: any) => {
                if (node.kind === ts.SyntaxKind.ExportDeclaration) {
                    var specifier = node.moduleSpecifier.text;
                    var exportAll = true;
                    var names = [null];
                    if (node.exportClause) {
                        names = node.exportClause.elements.map(n => n.name.text);
                    }
                    names.forEach(name => result.push({ name, specifier, exportAll, dirname }));
                } else if (find<ts.Node>(node.modifiers, m => m.kind === ts.SyntaxKind.ExportKeyword)) {
                    if (node.declarationList) {
                        node.declarationList.declarations.forEach(d => {
                            var name = d.name.text;
                            result.push({ name, module: null });
                        });
                    } else if (node.name) {
                        var name = node.name.text;
                        result.push({ name, module: null });
                    }
                } else {
                    // console.log('node', JSON.stringify(node));
                }
            });
            return result;
        })
        .then((dataList: Array<any>) => {
            return Promise.all(dataList.map(item => {
                if (!item.exportAll) return item;
                if (isRelative(item.specifier)) {
                    var moduleId = item.specifier + ".d.ts";
                    var resolvedId = path.resolve(item.dirname, moduleId);
                    return parse(resolvedId);
                } else {
                    return main(item.specifier, { baseDir: dirname });
                }
            }));
        })
        .then(result => {
            return flatten<any>(result);
        });
}
