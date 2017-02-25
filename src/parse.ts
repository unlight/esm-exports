import * as ts from 'typescript';
import * as Path from 'path';
import * as _ from 'lodash';
import { parseFile } from './parse-file';
import { Entry } from './entry';
import { parseDeclaration } from './parse-declaration';
import { parseKeyword } from './parse-keyword';
import { uniqEntryList } from './utils';
const isRelative = require('is-relative-path');
const unixify = require('unixify');

export type ParseOptions = {
    filepath?: string;
    module?: string;
}

export function parse(sourceText: string, options: ParseOptions = {}): Promise<Entry[]> {
    const {filepath, module} = options;
    const sourceFile = ts.createSourceFile('dummy.ts', sourceText, ts.ScriptTarget.ES2015, false);
    return _.chain(sourceFile.statements)
        .map((statement: ts.Statement) => {
            let names: string[];
            if (statement.kind === ts.SyntaxKind.ExportDeclaration) {
                names = parseDeclaration(statement);
            } else if (_.find(statement.modifiers, m => m.kind === ts.SyntaxKind.ExportKeyword)) {
                names = parseKeyword(statement);
            } else {
                return [];
            }
            const specifier: string = _.get<string>(statement, 'moduleSpecifier.text');
            const isDefault = Boolean(_.find(statement.modifiers, m => m.kind === ts.SyntaxKind.DefaultKeyword));
            return names.map(name => ({ name, specifier, isDefault }));
        })
        .flatten()
        .map(({name, specifier, isDefault}) => {
            if (!name && specifier && filepath) {
                let dirname = Path.dirname(filepath);
                return parseFile(specifier, { dirname, module });
            }
            let entry = new Entry({ name, filepath, specifier, module, isDefault });
            return Promise.resolve([entry]);
        })
        .thru(promises => Promise.all(promises))
        .value()
        .then(entryList => uniqEntryList(entryList));
}