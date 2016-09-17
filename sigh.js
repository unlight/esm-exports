var merge, glob, concat, write, env, debounce, pipeline;
var ts;
var ava;

module.exports = function (pipelines) {

    pipelines["source"] = [
        glob({ basePath: "src" }, "**/*.ts"),
        ts({declaration: false, sourceMap: false}),
        write("lib"),
    ];

    pipelines["test"] = [
        ava({files: "lib/*.test.js", serial: true })
    ];

    pipelines["build"] = [
        glob({ basePath: "src" }, "**/*.ts"),
        ts({declaration: true, sourceMap: true}),
        write("lib"),
    ];
};