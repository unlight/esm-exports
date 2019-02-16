import * as ts from 'typescript';
import { Entry } from './entry';
import readFile from 'fs-readfile-promise';
import * as resolve from 'resolve';
import { dirname } from 'path';
import flatten from 'lodash.flatten';
import debug from 'debug';
import rreaddir from 'recursive-readdir';

const d = debug('esm-exports');

type WalkNodeOptions = {
    module?: string;
    result?: Entry[];
    type?: 'text' | 'file' | 'directory';
    filepath?: string;
};

const resolveOptions: resolve.AsyncOpts = {
    extensions: ['.ts', '.d.ts', '.js', '.tsx', '.jsx', '.mjs'],
    packageFilter: (pkg: any) => {
        const { typings, module } = pkg;
        if (typings) {
            pkg.main = typings;
        } else if (module) {
            pkg.main = module;
        }
        return pkg;
    },
};

export async function main(target: string, options: WalkNodeOptions = {}): Promise<Entry[]> {
    d('target %s', target);
    d('options %o', options);
    let source: string = target;
    let file: string;
    if (!options.result) {
        options.result = [];
    }
    if (options.type === 'file') {
        file = source;
        source = await readFile(file).then(buffer => buffer.toString(), () => undefined);
    } else if (options.type === 'directory') {
        const files = await rreaddir(target);
        return flatten(await Promise.all(files.map(filepath => main(filepath, { type: 'file', filepath }))));
    }
    const sourceFile = ts.createSourceFile('dummy.ts', source, ts.ScriptTarget.ESNext, true);
    ts.forEachChild<ts.Node>(sourceFile, (node: any) => walkNode(node, options));
    // todo: Improve performance here
    if (options.type === 'file') {
        const fileResult = flatten(await Promise.all(options.result
            .filter(entry => !entry.name && entry.specifier)
            .map(entry => {
                try {
                    var filepath = resolve.sync(entry.specifier, { ...(resolveOptions as any), basedir: dirname(file) });
                } catch (err) {
                    return [];
                }
                return main(filepath, { ...options, filepath, result: [] });
            })));
        const specifiers = fileResult.map(entry => new Entry({ ...entry, filepath: file }));
        options.result.push(...specifiers, ...fileResult);
    }
    return Promise.resolve(filterEntries(options.result, item => item.id()));
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

function filterEntries(array: Entry[], iteratee) {
    return array.filter((value, index, self) => {
        const item = iteratee(value);
        return value.name && index === self.findIndex(other => iteratee(other) === item);
    });
}

function isDeclaration(node: ts.Node) {
    return node.kind === ts.SyntaxKind.FunctionDeclaration
        || node.kind === ts.SyntaxKind.InterfaceDeclaration
        || node.kind === ts.SyntaxKind.ClassDeclaration
        || node.kind === ts.SyntaxKind.TypeAliasDeclaration;
}
