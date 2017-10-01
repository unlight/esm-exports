import { Entry } from './entry';
import * as ts from 'typescript';
import * as _ from 'lodash';
import { ParseOptions } from './types';

export function parseDefinitions(sourceText: string, options: ParseOptions = {}): Entry[] {
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
        }
        ts.forEachChild(node, walk);
    }
    return result;
}