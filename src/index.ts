import * as ts from 'typescript';
import { Entry } from './entry';

type WalkNodeOptions = {
    module?: string;
    result: Entry[];
};

export function main(sourceText: string, options: WalkNodeOptions = { result: [] }): Entry[] {
    const sourceFile = ts.createSourceFile('dummy.ts', sourceText, ts.ScriptTarget.ESNext, true);
    ts.forEachChild<ts.Node>(sourceFile, (node: any) => {
        walkNode(node, options);
        return undefined;
    });
    return options.result;
}

function walkNode(node: ts.Node, options: WalkNodeOptions): any {
    debugger;
    // console.log("node.kind", node.kind);
    if (node.kind === ts.SyntaxKind.Identifier) {
        const name = (node as ts.Identifier).text;
        const statement = getParentOf(node, [
            ts.SyntaxKind.VariableStatement,
            ts.SyntaxKind.InterfaceDeclaration,
            ts.SyntaxKind.FunctionDeclaration,
            ts.SyntaxKind.ExportDeclaration
        ]);
        if (statement &&
            (statement.kind === ts.SyntaxKind.ExportDeclaration
                || hasExportModifier(statement)
            )) {
            options.result.push(new Entry({ ...options, name }));
        }
    } else if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
        const children = node.getChildren();
        const moduleBlock = children.find(c => c.kind === ts.SyntaxKind.ModuleBlock) as ts.Block | undefined;
        if (!moduleBlock) {
            return;
        }
        moduleBlock
            .statements.filter((st: any) => st.name && ts.isIdentifier(st.name))
            .map((node: any) => node.name.text)
            .forEach(name => {
                options.result.push(new Entry({ ...options, name, module: (node as any).name.text }));
            });
    }
    ts.forEachChild(node, (node) => walkNode(node, options));
}

function getParentOf(node: ts.Node, syntaxKinds: ts.SyntaxKind[]) {
    while (true) {
        if (node && node.parent && syntaxKinds.includes(node.parent.kind)) {
            return node.parent;
        }
        if (!node.parent) {
            break;
        }
        node = node.parent;
    }
    return undefined;
}

function hasExportModifier(node: ts.Node): boolean {
    const result = node.modifiers && node.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword);
    return result !== undefined;
}
