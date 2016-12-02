import * as path from "path";
import * as fs from "fs";
import { parse } from "./parse";
import { get, endsWith } from "lodash";
import { readFileResult } from "./readfile-result";
const resolvePkg = require("resolve-pkg");
const readFile: readFileResult = require("fs-readfile-promise");
const unixify = require("unixify");
const isRelative = require("is-relative-path");

const defaults = {
    baseDir: "."
};

export function node(nameOrFile: string, options: { [k: string]: any } = defaults): Promise<Array<any>> {
    var file: string;
    var {baseDir, parent} = options;
    var module: string = parent ? parent : nameOrFile;
    if (isRelative(nameOrFile)) {
        file = findFile(baseDir, nameOrFile);
    } else {
        var packageDir = resolvePkg(nameOrFile, { cwd: baseDir });
        var packageFile = path.join(packageDir, "package.json");
        var {typings} = require(packageFile);
        if (!typings) {
            return Promise.resolve([]);
        }
        file = findFile(packageDir, typings);
    }
    var dirname = path.dirname(file);
    dirname = unixify(dirname);
    return readFile(file, "utf8")
        .then((sourceText: string) => {
            var o = Object.assign({}, options, { module, file, dirname });
            return parse(sourceText, o);
        });
}

export function findFile(baseDir, name) {
    const checkExtensions = ["", ".ts", ".d.ts"];
    let file;
    for (let i = 0; i < checkExtensions.length; ++i) {
        let extFile = name + checkExtensions[i];
        file = path.resolve(baseDir, extFile);
        if (fs.existsSync(file)) {
            let stat = fs.statSync(file);
            if (stat.isDirectory()) continue;
            break;
        }
    }
    return file;
}