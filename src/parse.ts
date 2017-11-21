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

class EntrySet {

    readonly result: Entry[] = [];
    private set = new Set<string>();

    push(entry: Entry) {
        const id = entry.id();
        if (!this.set.has(id)) {
            this.set.add(id);
            this.result.push(entry);
        }
    }
}

export function parse(sourceText: string, options: ParseOptions = {}): Entry[] {
    const sourceFile = ts.createSourceFile('dummy.ts', sourceText, ts.ScriptTarget.ES2015, true);
    let { module, filepath } = options;
    let moduleEnd: number;
    const entrySet = new EntrySet();
    walk(sourceFile);
    function walk(statement: ts.Node) {
        const node = statement;
        if (node.pos >= moduleEnd) {
            module = undefined;
        }
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
                    const entry = new Entry({ name, module, filepath, specifier, isDefault });
                    entrySet.push(entry);
                });
            } break;
            case ts.SyntaxKind.ExportKeyword: {
                const declarations = get('declarationList.declarations', node.parent) || [];
                declarations.forEach(d => {
                    const name: string = d && d.name && d.name.text;
                    if (name) {
                        const entry = new Entry({ name, module, filepath });
                        entrySet.push(entry);
                    }
                    const names = get('name.elements', d) || [];
                    names.forEach(d => {
                        const name: string = d && d.name && d.name.text;
                        const entry = new Entry({ name, module, filepath });
                        entrySet.push(entry);
                    });
                });
                const name: string = get('name.text', node.parent);
                if (name) {
                    const isDefault = hasDefaultKeyword(node.parent);
                    const entry = new Entry({ name, module, filepath, isDefault });
                    entrySet.push(entry);
                }
            } break;
            case ts.SyntaxKind.ExportAssignment: {
                entrySet.result.push(new Entry({ module, cjs: true, ts: true }));
            } break;
        }
        if (node.kind === ts.SyntaxKind.SourceFile
            || node.kind === ts.SyntaxKind.ModuleDeclaration
            || (node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
            || (node.parent && node.parent.kind === ts.SyntaxKind.ModuleDeclaration)
            || (node.parent && node.parent.parent && node.parent.parent.kind === ts.SyntaxKind.SourceFile)
            || (node.parent && node.parent.parent && node.parent.parent.kind === ts.SyntaxKind.ModuleDeclaration)
        ) {
            ts.forEachChild(node, walk);
        }
    }
    return entrySet.result;
}
