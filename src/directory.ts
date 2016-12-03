/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
import * as fs from "fs";
import * as path from "path";
import { node } from "./";
import { flatten, endsWith, startsWith } from "lodash";
import { readFileResult } from "./readfile-result";
const readFile: readFileResult = require("fs-readfile-promise");
const recursive = require("recursive-readdir");
const unixify = require("unixify");

export function directory(target: string): Promise<any[]> {
    if (typeof target !== 'string') {
        return Promise.reject('Target must be a string');
    }
    var targetNodeModules = path.normalize(path.join(target, 'node_modules'));
    return new Promise<any[]>((resolve, reject) => {
        var files: string[] = recursive(target, [ignore.bind(null, targetNodeModules)], (err, files) => {
            if (err) return reject(err);
            resolve(files);
        });
    }).then(files => {
        return Promise.all(
            files.map(file => {
                file = path.relative(target, file);
                file = unixify(file);
                return node(`./${file}`, { baseDir: target });
            }))
            .then(result => {
                return flatten<any>(result);
            });
    })
}

function ignore(targetNodeModules, file, stats) {
    if (startsWith(file, targetNodeModules)) return true;
    if (stats.isDirectory()) return false;
    if (endsWith(path.extname(file), ".ts")) return false;
    return true;
}