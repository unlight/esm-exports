import * as ts from 'typescript';
import { Entry } from './entry';
// import * as Path from 'path';
// import * as _ from 'lodash';
// import { parseFile } from './parse-file';
// import { Entry } from './entry';
// import { parseDeclaration } from './parse-declaration';
// import { parseKeyword } from './parse-keyword';
// import { uniqEntryList } from './utils';

export type ParseOptions = {
    filepath?: string;
    module?: string;
}

export function parse(sourceText: string, options: ParseOptions = {}): Entry[] {
    const sourceFile = ts.createSourceFile('dummy.ts', sourceText, ts.ScriptTarget.ES2015, false);
    let { filepath, module } = options;
    let moduleEnd: number;
    let result: Entry[] = [];
    walk(sourceFile);
    function walk(node: ts.Node) {
        if (node.pos >= moduleEnd) {
            module = undefined;
        }
        switch (node.kind) {
            case ts.SyntaxKind.ModuleDeclaration: {
                let isDeclare = Boolean(_.find(node.modifiers, m => m.kind === ts.SyntaxKind.DeclareKeyword));
                if (!isDeclare) break;
                module = _.get<string>(node, 'name.text');
                moduleEnd = node.end;
            } break;
            case ts.SyntaxKind.ExportDeclaration: {
                let statement = (node as ts.ExportDeclaration);
                const names = [];
                const exportAll = !(statement.exportClause && statement.exportClause.elements);
                if (exportAll) {
                    names.push(null);
                } else if (statement.exportClause) {
                    statement.exportClause.elements.forEach(e => names.push(e.name.text));
                }
                names;
            } break;
            case ts.SyntaxKind.ExportKeyword: {
                if (!module) break;
                let declarations = _.get<any[]>(node.parent, 'declarationList.declarations', []);
                declarations.forEach(d => {
                    let name = _.get<string>(d, 'name.text');
                    let entry = new Entry({ name, module } as any);
                    result.push(entry);
                });
                let name = _.get<string>(node.parent, 'name.text');
                if (name) {
                    let entry = new Entry({ name, module } as any);
                    result.push(entry);
                }
            } break;
            default:
            // console.log("\n", (node as any));
        }
        ts.forEachChild(node, walk);
    }
    return result;
}

// export function parse(sourceText: string, options: ParseOptions = {}): Promise<Entry[]> {
//     const { filepath, module } = options;
//     const sourceFile = ts.createSourceFile('dummy.ts', sourceText, ts.ScriptTarget.ES2015, false);
//     return _.chain(sourceFile.statements)
//         .map((statement: ts.Statement) => {
//             let names: string[];
//             if (statement.kind === ts.SyntaxKind.ExportDeclaration) {
//                 names = parseDeclaration(statement);
//             } else if (_.find(statement.modifiers, m => m.kind === ts.SyntaxKind.ExportKeyword)) {
//                 names = parseKeyword(statement);
//             } else {
//                 return [];
//             }
//             const specifier: string = _.get<string>(statement, 'moduleSpecifier.text');
//             const isDefault = Boolean(_.find(statement.modifiers, m => m.kind === ts.SyntaxKind.DefaultKeyword));
//             return names.map(name => ({ name, specifier, isDefault }));
//         })
//         .flatten()
//         .map(({ name, specifier, isDefault }) => {
//             if (!name && specifier && filepath) {
//                 let dirname = Path.dirname(filepath);
//                 return parseFile(specifier, { dirname, module });
//             }
//             let entry = new Entry({ name, filepath, specifier, module, isDefault });
//             return Promise.resolve([entry]);
//         })
//         .thru(promises => Promise.all(promises))
//         .value()
//         .then(entryList => uniqEntryList(entryList));
// }
