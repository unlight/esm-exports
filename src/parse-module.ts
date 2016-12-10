import * as Path from "path";
import * as fs from "fs";
import { parse } from "./parse";
import { get, endsWith } from "lodash";
import { Entry } from "./entry";
const resolvePkg = require("resolve-pkg");
type readFileResult = (file: string, enc?: string) => Promise<string>;
const readFile: readFileResult = require("fs-readfile-promise");
// const unixify = require("unixify");
import { findFile } from "./find-file";

export type ParseModuleOptions = {
    dirname?: string;
    module?: string;
};

const defaults = {
    dirname: "."
};

export function parseModule(name: string, options: ParseModuleOptions = defaults): Promise<Entry[]> {
    let {dirname, module} = options;
    let packageDir = resolvePkg(name, { cwd: dirname });
    // TODO: Check packageDir for null.
    // console.log('packageDir', packageDir);
    let packageFile = Path.join(packageDir, "package.json");
    let {typings} = require(packageFile);
    if (!typings) {
        return Promise.resolve([]);
    }
    let filepath = findFile(typings, packageDir);
    if (!filepath) {
        return Promise.resolve([]);
    }
    // var dirname = Path.dirname(file);
    // dirname = unixify(dirname);
    return readFile(filepath, "utf8")
        .then((sourceText: string) => {
    		if (!module) module = name;
            // console.log('options', options);
            // console.log('sourceText', sourceText);
            // let o = Object.assign({}, options, { module, file, dirname });
            return parse(sourceText, { filepath, module });
        });
}