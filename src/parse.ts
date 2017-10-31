import * as ts from 'typescript';
import * as Path from 'path';
import * as _ from 'lodash';
import { parseFile } from './parse-file';
import { Entry } from './entry';
import { parseDeclaration } from './parse-declaration';
import { parseKeyword } from './parse-keyword';
import { uniqEntryList } from './utils';
import get = require('lodash/get');

export type ParseOptions = {
    filepath?: string;
    module?: string;
    statements?: ts.Statement[];
}

export function parse(sourceText: string, options: ParseOptions = {}): Promise<Entry[]> {
    const { filepath, module } = options;
    let statements = get(options, 'statements') as ts.Statement[];
    if (!statements) {
        const sourceFile = ts.createSourceFile('dummy.ts', sourceText, ts.ScriptTarget.ES2015, false);
        statements = sourceFile.statements as any;
    }
    return (_.chain as any)(statements)
        .map((node: ts.Node) => {
            let names: string[];
            if (node.kind === ts.SyntaxKind.ExportDeclaration) {
                names = parseDeclaration(node);
            } else if (_.find(node.modifiers, m => m.kind === ts.SyntaxKind.ExportKeyword)) {
                names = parseKeyword(node);
            } else if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
                if (_.find(node.modifiers, m => m.kind === ts.SyntaxKind.DeclareKeyword) && node.flags === ts.NodeFlags.None) {
                    let module = (node as any).name.text;
                    let statements = (node as any).body.statements;
                    return parse(null, { module, statements });
                } else if (node.flags === ts.NodeFlags.Namespace) {
                    let statements = (node as any).body.statements;
                    return parse(null, { module, statements });
                } else {
                    return [];
                }
            } else {
                return [];
            }
            const specifier: string = get<string>(node as any, 'moduleSpecifier.text', null);
            const isDefault = Boolean(_.find(node.modifiers, m => m.kind === ts.SyntaxKind.DefaultKeyword));
            return names.map(name => ({ name, specifier, isDefault }));
        })
        .flatten()
        .map((p: any) => {
            if (p instanceof Promise) {
                return p;
            }
            let { name, specifier, isDefault } = p;
            if (!name && specifier && filepath) {
                let dirname = Path.dirname(filepath);
                return parseFile(specifier, { dirname, module });
            }
            let entry = new Entry({ name, filepath, specifier, module, isDefault });
            return Promise.resolve(entry);
        })
        .thru(promises => Promise.all(promises))
        .value()
        .then(entryList => uniqEntryList(entryList));
}