/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
import * as fs from "fs";
import * as path from "path";
import main from "./main";
import {flatten} from "lodash";
const readFile: readFileResult = require("fs-readfile-promise");
type readFileResult = (file: string, enc?: string) => Promise<string>;
var read = require("fs-readdir-recursive");

export default function directory(target: string) {
    var baseDir = target;
    var files: string[] = read(target, filterFiles);
    return Promise.all(
        files.map(file => {
            return main(`./${file}`, { baseDir });
        }))
        .then(result => {
            return flatten<any>(result);
        });
}

function filterFiles(file) {
    var result = file[0] !== ".";
    return result;
}