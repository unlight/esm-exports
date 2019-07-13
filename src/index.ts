import * as ts from 'typescript';
import { Entry } from './entry';
import fsReadFilePromise from 'fs-readfile-promise';
import * as resolve from 'resolve';
import path from 'path';
import flatten from 'lodash.flatten';
import debug from 'debug';
import recursiveReadDir from 'recursive-readdir';
import * as fs from 'fs';

const d = debug('esm-exports');

type WalkNodeOptions = {
    module?: string;
    result?: Entry[];
    type?: 'text' | 'file' | 'directory' | 'module';
    filepath?: string;
    isDeclarationFile?: boolean;
    basedir?: string;
    ignorePatterns?: string[];
    exportsAs?: { [k: string]: string };
};

type IgnoreOption = ((file: string, stats: fs.Stats) => boolean) | string;

const resolveOptions: resolve.AsyncOpts = {
    extensions: ['.ts', '.d.ts', '.js', '.tsx', '.jsx', '.mjs'],
    packageFilter: (pk: any) => {
        if (pk.typings) {
            pk.main = pk.typings;
        } else if (pk.types) {
            pk.main = pk.types;
        } else if (pk.module) {
            pk.main = pk.module;
        }
        return pk;
    },
    basedir: undefined,
};

export async function main(target: string, options: WalkNodeOptions = {}): Promise<Entry[]> {
    d('target %s', target);
    d('options %o', options);
    let source: string = target;
    let file: string = '';
    let directory: string;
    if (!options.result) {
        options.result = [];
    }
    if (options.type === 'file') {
        file = target;
        d('reading file %s', file);
        source = await fsReadFilePromise(file).then(buffer => buffer.toString(), (err) => undefined);
    } else if (options.type === 'directory') {
        directory = target;
        try {
            let ignore: IgnoreOption[] = [rreaddirIgnore];
            if (Array.isArray(options.ignorePatterns) && options.ignorePatterns.every(p => typeof p === 'string')) {
                ignore = ignore.concat(options.ignorePatterns);
            }
            const files = await recursiveReadDir(directory, ignore);
            return flatten(await Promise.all(files.map(filepath => main(filepath, { type: 'file', filepath }))));
        } catch (err) {
            return [];
        }
    } else if (options.type === 'module') {
        const basedir = options.basedir || process.cwd();
        try {
            file = resolve.sync(target, { ...<any>resolveOptions, basedir });
        } catch (err) {
            return [];
        }
        options.result = await main(file, { ...options, module: target, type: 'file' });
        const testPath = path.join(basedir, 'node_modules', target);
        const submodules = flatten(await Promise.all(fs.readdirSync(testPath)
            .filter(file => fs.existsSync(path.join(basedir, `node_modules/${target}/${file}/package.json`)))
            .map((folder) => {
                return main(`${target}/${folder}`, { ...options, module: `${target}/${folder}` });
            })));
        options.result.push(...submodules);
        // todo: remove hack
        if (target === '@types/node') {
            const entries = await main('node_modules/@types/node', { ...options, type: 'directory' });
            options.result.push(...entries);
        }
    }
    if (source) {
        const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.ESNext, true);
        options.isDeclarationFile = sourceFile.isDeclarationFile;
        ts.forEachChild<ts.Node>(sourceFile, (node: any) => walkNode(node, options));
        if (options.exportsAs) {
            options.result.forEach(entry => {
                const newModule = options.exportsAs[entry.module];
                if (newModule) {
                    entry.module = newModule;
                }
            });
        }
    }
    // todo: Improve performance here
    if (options.type === 'file') {
        d('result before specifier filter %O', options.result);
        const fileResult = flatten(await Promise.all(options.result
            .filter(entry => !entry.name && entry.specifier)
            .map(entry => {
                try {
                    var filepath = resolve.sync(entry.specifier, { ...(<any>resolveOptions), basedir: path.dirname(file) });
                } catch (err) {
                    return [];
                }
                return main(filepath, { ...options, filepath, result: [] }).catch(err => []);
            })));
        const specifiers = fileResult.map(entry => new Entry({ ...entry, filepath: file }));
        options.result.push(...specifiers, ...fileResult);
    }
    d('result before final filter %O', options.result);
    return Promise.resolve(filterEntries(options.result, item => item.id()));
}

export { main as esmExports };

function walkNode(node: ts.Node, options: WalkNodeOptions): any {
    if ((isModuleExportsAssign(node) || isThisExportsAssign(node)) && (<any>node).left.name && (<any>node).left.name.kind === ts.SyntaxKind.Identifier) {
        const name = getNameText((<any>node).left);
        if (name) {
            options.result.push(new Entry({ ...options, name }));
        }
    } else if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
        if (hasDeclareKeyword(node)) {
            const moduleBlock = <ts.Block | undefined>(node.getChildren().find(c => c.kind === ts.SyntaxKind.ModuleBlock));
            if (!moduleBlock) {
                return;
            }
            const declaredModule = getNameText(node);
            moduleBlock.forEachChild(node => walkNode(node, { ...options, module: declaredModule }));
        } else if (options.module) {
            const name = getNameText(node);
            if (name) {
                options.result.push(new Entry({ ...options, name }));
            }
        }
    } else if (node.kind === ts.SyntaxKind.ExportDeclaration) {
        const specifier = (<any>node).moduleSpecifier;
        if (specifier) {
            options.result.push(new Entry({ ...options, specifier: specifier.text }));
        }
    } else if (node.kind === ts.SyntaxKind.VariableDeclarationList && node.parent && hasExportModifier(node.parent)) {
        (<any>node).declarations.forEach(d => {
            if (d.name.kind === ts.SyntaxKind.Identifier && d.name && d.name.text) {
                options.result.push(new Entry({ ...options, name: d.name.text }));
            } else if (d.name.kind === ts.SyntaxKind.ObjectBindingPattern) {
                d.name.elements.forEach(element => {
                    if (element.name && element.name.text) {
                        options.result.push(new Entry({ ...options, name: element.name.text }));
                    }
                });
            }
        });
    } else if (node.kind === ts.SyntaxKind.ExportSpecifier) {
        const name = getNameText(node);
        if (name) {
            options.result.push(new Entry({ ...options, name }));
        }
    } else if (node.kind === ts.SyntaxKind.ExportAssignment) {
        const name = (<any>node).expression.text;
        options.result.push(new Entry({ ...options, name, isDefault: true }));
        if (options.module != undefined) {
            let newModule = options.module;
            if (options.isDeclarationFile) {
                newModule = typedModule(newModule);
            }
            options.result.forEach(x => {
                if (x.module === name) {
                    x.module = newModule;
                }
            });
            if ((node as any).isExportEquals) {
                options.exportsAs = options.exportsAs || {};
                options.exportsAs[name] = newModule;
            }
        }
    } else if (isDeclaration(node) && (hasExportModifier(node) || options.module != undefined)) {
        const newModule = typedModule(options.module);
        const isDefault = hasDefaultModifier(node);
        const name = getNameText(node);
        if (name) {
            options.result.push(new Entry({ ...options, name, isDefault, module: newModule }));
        }
    } else if (ts.isImportEqualsDeclaration(node)) {
        const name = node.name.getText();
        options.result.push(new Entry({ ...options, name }));
    }
    // else if (isDeclaration(node) && isInDeclaredModule(node)) {
    //     const isDefault = hasDefaultModifier(node);
    //     options.result.push(new Entry({ ...options, name: (<any>node).name.text, isDefault, module: (<any>node).parent.parent.name.text }));
    // }
    // todo: Check depth
    node.forEachChild(node => walkNode(node, options));
}

function typedModule(name: string) {
    if (name && name.indexOf('@types/') === 0) {
        name = name.slice(7);
    }
    return name;
}

function rreaddirIgnore(file: string, stats: fs.Stats): boolean {
    if (stats.isFile()) {
        const ext = path.extname(file);
        if (resolveOptions.extensions.indexOf(ext) === -1) {
            return true;
        }
    } else if (stats.isDirectory() && path.basename(file) === 'node_modules') {
        return true;
    }
    return false;
}

function isModuleExportsAssign(node: any) {
    return node.kind === ts.SyntaxKind.BinaryExpression
        && node.left.kind === ts.SyntaxKind.PropertyAccessExpression && node.left.expression.kind === ts.SyntaxKind.PropertyAccessExpression
        && node.left.expression.expression && node.left.expression.expression.kind === ts.SyntaxKind.Identifier
        && node.left.expression.expression.escapedText === 'module'
        && node.left.expression.name && node.left.expression.name.kind === ts.SyntaxKind.Identifier && getNameText(node.left.expression) === 'exports'
        && node.parent && node.parent.kind === ts.SyntaxKind.ExpressionStatement
        && node.parent.parent && node.parent.parent.kind === ts.SyntaxKind.SourceFile;
}

function isThisExportsAssign(node: any) {
    return node.kind === ts.SyntaxKind.BinaryExpression
        && node.left.kind === ts.SyntaxKind.PropertyAccessExpression && node.left.expression.kind === ts.SyntaxKind.ThisKeyword
        && node.parent && node.parent.kind === ts.SyntaxKind.ExpressionStatement
        && node.parent.parent && node.parent.parent.kind === ts.SyntaxKind.SourceFile;
}

function isInDeclaredModule(node: any) {
    return node.parent && node.parent.kind === ts.SyntaxKind.ModuleBlock
        && node.parent.parent && node.parent.parent.kind === ts.SyntaxKind.ModuleDeclaration
        && node.parent.parent.modifiers && node.parent.parent.modifiers.find(m => m.kind === ts.SyntaxKind.DeclareKeyword) != undefined
        && node.parent.parent.name != undefined && getNameText(node.parent.parent) != undefined;
}

function isModuleFromOptions(options: WalkNodeOptions) {
    return options.module != undefined;
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
    return node.modifiers && node.modifiers.find(m => m.kind === ts.SyntaxKind.DeclareKeyword) !== undefined;
}

function filterEntries(entries: Entry[], iteratee) {
    return entries.filter((entry, index, self) => {
        if (entry.module && entry.module.indexOf('@types/') === 0) {
            return false;
        }
        if (entry.filepath && (entry.filepath.indexOf('node_modules/@types/') !== -1 || entry.filepath.indexOf('node_modules\\@types\\') !== -1)) {
            return false;
        }
        const item = iteratee(entry);
        return entry.name
            && (entry.module || entry.filepath)
            && index === self.findIndex(other => iteratee(other) === item);
    });
}

function isDeclaration(node: ts.Node) {
    return node.kind === ts.SyntaxKind.FunctionDeclaration
        || node.kind === ts.SyntaxKind.InterfaceDeclaration
        || node.kind === ts.SyntaxKind.ClassDeclaration
        || node.kind === ts.SyntaxKind.TypeAliasDeclaration;
}

function getNameText(node: any) {
    return node && node.name && node.name.text;
}
