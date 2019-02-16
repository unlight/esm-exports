import * as ts from 'typescript';
import { Entry } from './entry';
const readFile = require('fs-readfile-promise');

type WalkNodeOptions = {
    module?: string;
    result?: Entry[];
    type?: 'text' | 'file';
};

export async function main(target: string, options: WalkNodeOptions = {}): Promise<Entry[]> {
    let source: string = target;
    if (!options.result) {
        options.result = [];
    }
    if (options.type === 'file') {
        source = await readFile(target).then(buffer => buffer.toString(), () => undefined);
    }
    const sourceFile = ts.createSourceFile('dummy.ts', source, ts.ScriptTarget.ESNext, true);
    ts.forEachChild<ts.Node>(sourceFile, (node: any) => walkNode(node, options));
    // todo: Improve performance here
    return Promise.resolve(uniqBy(options.result, item => item.id()));
}

function walkNode(node: ts.Node, options: WalkNodeOptions): any {
    // console.log("node.kind", node.kind);
    if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
        if (hasDeclareKeyword(node)) {
            const moduleBlock = node.getChildren().find(c => c.kind === ts.SyntaxKind.ModuleBlock) as ts.Block | undefined;
            if (!moduleBlock) {
                return;
            }
            const declaredModule = (node as any).name.text;
            moduleBlock.forEachChild(node => walkNode(node, { ...options, module: declaredModule }));
        } else if (options.module) {
            options.result.push(new Entry({ ...options, name: (node as any).name.text }));
        }
    } else if (node.kind === ts.SyntaxKind.ExportDeclaration) {
        const specifier = ((node as ts.ExportDeclaration).moduleSpecifier as any);
        if (specifier) {
            options.result.push(new Entry({ ...options, specifier: specifier.text }));
        }
    } else if (node.kind === ts.SyntaxKind.VariableDeclarationList && node.parent && hasExportModifier(node.parent)) {
        (node as any).declarations.forEach(d => {
            if (d.name.kind === ts.SyntaxKind.Identifier) {
                options.result.push(new Entry({ ...options, name: d.name.text }));
            } else if (d.name.kind === ts.SyntaxKind.ObjectBindingPattern) {
                d.name.elements.forEach(element => {
                    options.result.push(new Entry({ ...options, name: element.name.text }));
                });
            }
        });
    } else if (node.kind === ts.SyntaxKind.ExportSpecifier) {
        options.result.push(new Entry({ ...options, name: (node as any).name.text }));
    } else if (node.kind === ts.SyntaxKind.ExportAssignment) {
        const name = (node as any).expression.text;
        if (options.module != null) {
            options.result.forEach(x => {
                if (x.module === name) {
                    x.module = options.module;
                }
            });
        } else {
            options.result.push(new Entry({ ...options, name, isDefault: true }));
        }
    } else if (isDeclaration(node) && (options.module != null || hasExportModifier(node))) {
        const isDefault = /*node.kind === ts.SyntaxKind.ExportAssignment || */ hasDefaultModifier(node);
        options.result.push(new Entry({ ...options, name: (node as any).name.text, isDefault }));
    }
    // todo: Check depth
    node.forEachChild(node => walkNode(node, options));
}

function getParentIf(node: ts.Node, syntaxKinds: ts.SyntaxKind[]) {
    if (node && node.parent && syntaxKinds.includes(node.parent.kind)) {
        return node.parent;
    }
    return undefined;
}

function hasExportModifier(node: ts.Node): boolean {
    const result = node.modifiers && node.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword);
    return result !== undefined;
}

function hasDefaultModifier(node: ts.Node): boolean {
    const result = node.modifiers && node.modifiers.find(m => m.kind === ts.SyntaxKind.DefaultKeyword);
    return result !== undefined;
}

function hasDeclareKeyword(node: ts.Node): boolean {
    return node.modifiers && node.modifiers.find(m => m.kind === ts.SyntaxKind.DeclareKeyword) !== undefined
}

function uniqBy(array, iteratee) {
    return array.filter((value, index, self) => index === self.findIndex(other => iteratee(other) === iteratee(value)));
}

function isDeclaration(node: ts.Node) {
    return node.kind === ts.SyntaxKind.FunctionDeclaration
        || node.kind === ts.SyntaxKind.InterfaceDeclaration
        || node.kind === ts.SyntaxKind.ClassDeclaration
        || node.kind === ts.SyntaxKind.TypeAliasDeclaration;
}
