import * as ts from 'typescript';
import { Entry } from './entry';
import { get } from './get';

export type ParseOptions = {
    filepath?: string;
    module?: string;
}

function hasDefaultKeyword(node: ts.Node) {
    return Boolean(node.modifiers && node.modifiers.find(m => m.kind === ts.SyntaxKind.DefaultKeyword));
}

export function parse(sourceText: string, options: ParseOptions = {}): Entry[] {
    debugger;
    const sourceFile = ts.createSourceFile('dummy.ts', sourceText, ts.ScriptTarget.ES2015, true);
    let { filepath, module } = options;
    let moduleEnd: number;
    let result: Entry[] = [];
    walk(sourceFile);
    function walk(statement: ts.Node) {
        const node = statement;
        if (node.pos >= moduleEnd) {
            module = undefined;
        }
        (node.getText());
        switch (node.kind) {
            case ts.SyntaxKind.ModuleDeclaration: {
                '233';
                const isDeclare = Boolean(node.modifiers && node.modifiers.find(m => m.kind === ts.SyntaxKind.DeclareKeyword));
                if (!isDeclare) break;
                module = get('name.text', node) as string;
                moduleEnd = node.end;
            } break;
            case ts.SyntaxKind.ExportDeclaration: {
                '244';
                const node = statement as ts.ExportDeclaration;
                const names: string[] = [];
                const exportAll = !(node.exportClause && node.exportClause.elements);
                if (exportAll) {
                    names.push(null);
                } else if (node.exportClause) {
                    node.exportClause.elements.forEach(e => names.push(e.name.text));
                }
                const specifier: string = get('moduleSpecifier.text', node);
                const isDefault = hasDefaultKeyword(node);
                names.forEach(name => {
                    result.push(new Entry({ name, module, specifier, isDefault }));
                });
            } break;
            case ts.SyntaxKind.ExportKeyword: {
                '84';
                const declarations = get('declarationList.declarations', node.parent) || [];
                declarations.forEach(d => {
                    const name: string = get('name.text', d);
                    if (name) {
                        result.push(new Entry({ name, module }));
                    }
                    const names = get('name.elements', d) || [];
                    names.forEach(d => {
                        const name: string = get('name.text', d);
                        result.push(new Entry({ name, module }));
                    });
                });
                const name: string = get('name.text', node.parent);
                if (name) {
                    const isDefault = hasDefaultKeyword(node.parent);
                    result.push(new Entry({ name, module, isDefault }));
                }
            } break;
            // case ts.SyntaxKind.ExportAssignment: {
            //     debugger;
            // } break;
        }
        ts.forEachChild(node, walk);
    }
    return result;
}
