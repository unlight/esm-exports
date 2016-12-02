import test from "ava";
import {directory} from "./";
import {filter} from "lodash";
const pkgDir = require("pkg-dir");
var rootPath;

test.before(t => {
    rootPath = pkgDir.sync();
});

test("smoke", t => {
    t.truthy(directory);
});

test("should parse directory", t => {
	return directory(rootPath + "/src")
		.then(result => {
			var [parse] = filter(result, item => item.name === "parse");
			t.truthy(parse);
		});
});

// test("should parse directory", t => {
// 	return directory(rootPath + "/src")
// 		.then(result => {
// 			// console.log('result', result);
// 		});
// });