import * as ts from 'typescript';
import { Entry } from './entry';
import { get } from './get';

export type ParseOptions = {
    module?: string;
    basedir?: string;
    filepath?: string;
};

function hasDefaultKeyword(node?: ts.Node) {
    return Boolean(node && node.modifiers && node.modifiers.find(m => m.kind === ts.SyntaxKind.DefaultKeyword));
}

export function parse(sourceText: string, options: ParseOptions = {}): Entry[] {
    const sourceFile = ts.createSourceFile('dummy.ts', sourceText, ts.ScriptTarget.ES2015, true);
    let { module, filepath } = options;
    let moduleEnd: number;
    let result: Entry[] = [];
    walk(sourceFile);
    function walk(statement: ts.Node) {
        const node = statement;
        if (node.pos >= moduleEnd) {
            module = undefined;
        }
        // (node.getText());
        switch (node.kind) { // eslint-disable-line tslint/config
            case ts.SyntaxKind.ModuleDeclaration: {
                const isDeclare = Boolean(node.modifiers && node.modifiers.find(m => m.kind === ts.SyntaxKind.DeclareKeyword));
                if (!isDeclare) {
                    break;
                }
                module = get('name.text', node) as string;
                moduleEnd = node.end;
            } break;
            case ts.SyntaxKind.ExportDeclaration: {
                const node = statement as ts.ExportDeclaration;
                const names: Array<(string | undefined)> = [];
                const exportAll = !(node.exportClause && node.exportClause.elements);
                if (exportAll) {
                    names.push(undefined);
                } else if (node.exportClause) {
                    node.exportClause.elements.forEach(e => names.push(e.name.text));
                }
                const specifier: string = get('moduleSpecifier.text', node);
                const isDefault = hasDefaultKeyword(node);
                names.forEach(name => {
                    result.push(new Entry({ name, module, filepath, specifier, isDefault }));
                });
            } break;
            case ts.SyntaxKind.ExportKeyword: {
                const declarations = get('declarationList.declarations', node.parent) || [];
                declarations.forEach(d => {
                    const name: string = get('name.text', d);
                    if (name) {
                        result.push(new Entry({ name, module, filepath }));
                    }
                    const names = get('name.elements', d) || [];
                    names.forEach(d => {
                        const name: string = get('name.text', d);
                        result.push(new Entry({ name, module, filepath }));
                    });
                });
                const name: string = get('name.text', node.parent);
                if (name) {
                    const isDefault = hasDefaultKeyword(node.parent);
                    result.push(new Entry({ name, module, filepath, isDefault }));
                }
            } break;
            // case ts.SyntaxKind.ExportAssignment: {
            //     console.log("node", node);
            //     debugger;
            // } break;
        }
        ts.forEachChild(node, walk);
    }
    return result;
}
