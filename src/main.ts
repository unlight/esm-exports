/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
import * as path from "path";
import * as fs from "fs";
import parse from "./parse";
import {get} from "lodash";
const resolvePkg = require('resolve-pkg');
type readFileResult = (file: string, enc?: string) => Promise<string>;
const readFile: readFileResult = require("fs-readfile-promise");
const unixify = require("unixify");
const isRelative = require("is-relative-path");

const defaults = {
    baseDir: "."
};

export default function main(nameOrFile: string, options: { [k: string]: any } = defaults): Promise<Array<any>> {
    var file: string;
    var {baseDir, parent} = options;
    var module: string = parent ? parent : nameOrFile;
    if (isRelative(nameOrFile)) {
        var extFile = nameOrFile + ".d.ts";
        file = path.resolve(baseDir, extFile);
    } else {
        var packageDir = resolvePkg(nameOrFile, { cwd: baseDir });
        var packageFile = path.join(packageDir, "package.json");
        var {typings} = require(packageFile);
        if (!typings) {
            return Promise.resolve([]);
        }
        file = path.join(packageDir, typings);
    }
    var dirname = path.dirname(file);
    dirname = unixify(dirname);
    return readFile(file, "utf8")
        .then((sourceText: string) => {
            var o = Object.assign({}, options, { module, file, dirname });
            return parse(sourceText, o);
        });
}