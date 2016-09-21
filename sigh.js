var merge, glob, concat, write, env, debounce, pipeline;
var ts;
var ava;
var thru;

module.exports = function (pipelines) {

    pipelines["source"] = [
        glob({ basePath: "src" }, "**/!(*.test).ts"),
        ts({declaration: false, sourceMap: false, module: "commonjs"}),
        write("lib"),
    ];

    pipelines["test"] = [
        glob({ basePath: "src" }, "**/*.test.ts"),
        thru(event => {
            event.changeFileSuffix("js");
            return event;
        }),
        write("lib"),
        ava({files: "lib/*.test.js", verbose: true, serial: true})
    ];

    pipelines["build"] = [
        glob({ basePath: "src" }, "**/!(*.test).ts"),
        ts({declaration: true, sourceMap: true}),
        write("lib"),
    ];
};