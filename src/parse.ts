/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
import * as ts from "typescript";
// import Entry from "./entry";
import {find} from "lodash";
const readFile = require("fs-readfile-promise");

export default function parse(file: string) {
    return readFile(file, "utf8")
        .then((sourceText: string) => {
            var result = [];
            var sourceFile = ts.createSourceFile("dummy.ts", sourceText, ts.ScriptTarget.ES6, false);
            sourceFile.statements.forEach((node: any) => {
                if (node.kind === ts.SyntaxKind.ExportDeclaration) {
                    var exportAll = false;
                    var specifier = node.moduleSpecifier.text;
                    if (node.exportClause) {
                        var names = node.exportClause.elements.map(n => n.name.text);
                        names.forEach(name => result.push({ name, specifier, exportAll }));
                    } else {
                        exportAll = true;
                        result.push({ specifier, exportAll });
                    }
                } else if (find(node.modifiers, m => m.kind === ts.SyntaxKind.ExportKeyword)) {
                    throw "ts.SyntaxKind.ExportKeyword";
                }
            });
            return result;
        });
}
