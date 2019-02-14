import * as ts from 'typescript';
import { Entry } from './entry';

type WalkNodeOptions = {
    module?: string;
    declaredModule?: string;
};

function walkNode(node: ts.Node, options: WalkNodeOptions = {}): any {
    debugger;
    // console.log("node.kind", node.kind);
    if (node.kind === ts.SyntaxKind.Identifier) {
        const name = (node as ts.Identifier).escapedText;
    } else if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
        const children = node.getChildren();
        const moduleBlock = children.find(c => c.kind === ts.SyntaxKind.ModuleBlock) as ts.Block | undefined;
        if (!moduleBlock) {
            return;
        }
        let declaredModule = (node as any).name.text;
        return moduleBlock
            .statements.filter((st: any) => st.name && ts.isIdentifier(st.name))
            .map((node: any) => node.name.text)
            .map(name => new Entry({ ...options, name, module: declaredModule }));
    }
    ts.forEachChild(node, walkNode);
}

export function main(sourceText: string, options: WalkNodeOptions = {}) {
    const sourceFile = ts.createSourceFile('dummy.ts', sourceText, ts.ScriptTarget.ESNext, true);
    let result = [];
    ts.forEachChild<ts.Node>(sourceFile, (node: any) => {
        result = walkNode(node, options);
        return undefined;
    });
    return result;
}

function hasParentOf(node: ts.Node, syntaxKinds: ts.SyntaxKind[]) {
    while (true) {
        if (node && node.parent && syntaxKinds.includes(node.parent.kind)) {
            return true;
        }
        node = node.parent;
    }
    return false;
}
