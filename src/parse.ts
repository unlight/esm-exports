import * as ts from "typescript";
import * as path from "path";
import { find, flatten, get, uniqBy } from "lodash";
import { node } from "./";
import { Entry } from "./entry.interface";
const isRelative = require("is-relative-path");
const unixify = require("unixify");

export function parse(sourceText: string, options: any = {}): Promise<Entry[]> {
    var entryList: Array<Entry> = [];
    var sourceFile = ts.createSourceFile("dummy.ts", sourceText, ts.ScriptTarget.ES2015, false);
    var {dirname, module, file} = options;
    if (module) {
        module = unixify(module);
    }
    sourceFile.statements.forEach((statement: any) => {
        if (statement.kind === ts.SyntaxKind.ExportDeclaration) {
            var specifier: string = get(statement, "moduleSpecifier.text", null);
            var exportAll = !(statement.exportClause && statement.exportClause.elements);
            if (exportAll) {
                var names = [null];
            }
            if (statement.exportClause) {
                names = statement.exportClause.elements.map(n => n.name.text);
            }
            names.forEach(name => entryList.push({ name, module, specifier, exportAll, dirname }));
        } else if (find<ts.Node>(statement.modifiers, m => m.kind === ts.SyntaxKind.ExportKeyword)) {
            // TODO: Combine ifs later.
            if (statement.declarationList) {
                statement.declarationList.declarations.forEach(d => {
                    var name = d.name.text;
                    entryList.push({ name, module });
                });
            } else if (statement.name) {
                var name = statement.name.text;
                var {specifier, baseDir}: {specifier: string, baseDir: string} = options;
                if (specifier && isRelative(specifier)) {
                    var relative: string = unixify(path.relative(baseDir, file));
                    // TODO: strip ts or dts extension
                    var exact = `${module}/${relative.slice(0, -(".d.ts".length))}`;
                }
                entryList.push({ name, module, relative, exact, specifier });
            }
        }
    });
    return Promise.all(
        entryList.map<any>(item => {
            if (!item.exportAll) {
                return item;
            }
            return node(item.specifier, { baseDir: dirname, parent: module, specifier: item.specifier });
        }))
        .then(result => {
            return flatten(result);
        })
        .then(result => {
            return uniqBy<Entry>(result, (value) => JSON.stringify([value.name, value.module]));
        });
}