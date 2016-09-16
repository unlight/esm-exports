var merge, glob, concat, write, env, debounce, pipeline;
var ts;
var ava;

module.exports = function (pipelines) {

    pipelines["dev"] = [
        glob({ basePath: "src" }, "**/*.ts"),
        ts({declaration: false, sourceMap: false}),
        write("lib"),
        ava({files: "lib/*.test.js", source: "src/*.ts", verbose: true, serial: true })
    ];

    pipelines["build:prod"] = [
        glob({ basePath: "src" }, "**/*.ts"),
        ts({declaration: true, sourceMap: true}),
        write("lib"),
    ];
};