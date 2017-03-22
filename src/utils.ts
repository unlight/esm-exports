import * as fs from 'fs';
import * as Path from 'path';
import { Entry } from './entry';
import * as _ from 'lodash';

const checkExtensions = ['', '.ts', '.d.ts', '.js', '.tsx', '.jsx'];

export function findFile(name, dirname = '.'): Promise<string> {
    let file: string = null;
    for (let i = 0; i < checkExtensions.length; i++) {
        let extFile = name + checkExtensions[i];
        let testFile = Path.resolve(dirname, extFile);
        try {
            var stat = fs.statSync(testFile);
        } catch (e) {
            continue;
        }
        if (stat.isDirectory()) continue;
        file = testFile;
        break;
    }
    return Promise.resolve(file)
}

export function uniqEntryList(entryListCollection) {
    return _.chain(entryListCollection)
        .flatten<Entry>()
        .uniqBy(entry => entry.hash())
        .value();
}
