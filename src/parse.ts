/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
import * as ts from "typescript";
import * as path from "path";
import {find, flatten, get} from "lodash";
import main from "./main";
const isRelative = require("is-relative-path");
const unixify = require("unixify");

export default function parse(sourceText: string, options: any = {}) {
    var entryList: Array<any> = [];
    var sourceFile = ts.createSourceFile("dummy.ts", sourceText, ts.ScriptTarget.ES6, false);
    var {dirname, module, file} = options;
    if (module) {
        module = unixify(module);
    }
    sourceFile.statements.forEach((node: any) => {
        if (node.kind === ts.SyntaxKind.ExportDeclaration) {
            var specifier: string = get(node, "moduleSpecifier.text", null);
            var exportAll = !(node.exportClause && node.exportClause.elements);
            if (exportAll) {
                var names = [null];
            }
            if (node.exportClause) {
                names = node.exportClause.elements.map(n => n.name.text);
            }
            names.forEach(name => entryList.push({ name, specifier, exportAll, dirname }));
        } else if (find<ts.Node>(node.modifiers, m => m.kind === ts.SyntaxKind.ExportKeyword)) {
            // TODO: Combine ifs later.
            if (node.declarationList) {
                node.declarationList.declarations.forEach(d => {
                    var name = d.name.text;
                    entryList.push({ name, module });
                });
            } else if (node.name) {
                var name = node.name.text;
                var {specifier: string, baseDir} = options;
                if (specifier && isRelative(specifier)) {
                    var relative: string = unixify(path.relative(baseDir, file));
                    // TODO: strip ts or dts extension
                    var exact = `${module}/${relative.slice(0, -(".d.ts".length))}`;
                }
                entryList.push({ name, module, relative, exact, specifier});
            }
        }
    });
    return Promise.all(entryList.map(item => {
        if (!item.exportAll) {
            return item;
        }
        return main(item.specifier, { baseDir: dirname, parent: module, specifier: item.specifier });
    }))
        .then(result => {
            return flatten<any>(result);
        });
}