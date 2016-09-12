/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
import * as path from "path";
import * as fs from "fs";
import parse from "./parse";
const readFile = require('fs-readfile-promise');
const resolvePkg = require('resolve-pkg');

const defaults = {
	baseDir: "."
};

export default function main(name: string, {baseDir}: {[k: string]: any} = defaults): Promise<Array<any>> {
	// var packageFile = path.join(baseDir, "node_modules", name, "package.json");
	var packageDir = resolvePkg(name, {cwd: baseDir});
	var packageFile = path.join(packageDir, "package.json");
	var {typings} = require(packageFile);
	if (!typings) {
		return Promise.resolve([]);
	}
	var typingsFile = path.join(packageDir, typings);
	return parse(typingsFile);
}