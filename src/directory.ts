/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
import * as fs from "fs";
import * as path from "path";
import {node} from "./";
import {flatten, endsWith} from "lodash";
import {readFileResult} from "./types/readfile-result";
const readFile: readFileResult = require("fs-readfile-promise");
const recursive = require("recursive-readdir");
const unixify = require("unixify");

export default function directory(target: string) {
    var baseDir = target;
    return new Promise<any[]>((resolve, reject) => {
        var files: string[] = recursive(target, [ignore], (err, files) => {
            if (err) return reject(err);
            resolve(files);
        });
    }).then(files => {
        return Promise.all(
            files.map(file => {
                file = path.relative(baseDir, file);
                file = unixify(file);
                return node(`./${file}`, { baseDir });
            }))
            .then(result => {
                return flatten<any>(result);
            });
    })
}

function ignore(file, stats) {
    if (stats.isDirectory()) return false;
    if (endsWith(path.extname(file), ".ts")) return false;
    return true;
}