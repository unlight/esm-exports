/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
import * as path from "path";
import * as fs from "fs";
import parse from "./parse";
const readFile = require('fs-readfile-promise');

const defaults = {
	baseDir: "."
};

export default function main(name: string, {baseDir} = defaults) {
	var packageFile = path.join(baseDir, "node_modules", name, "package.json");
	var packageDir = path.dirname(packageFile);
	var {typings} = require(packageFile);
	if (!typings) {
		return;
	}
	var typingsFile = path.join(packageDir, typings);
	return parse(typingsFile);
}