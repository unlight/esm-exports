var merge, glob, concat, write, env, debounce, pipeline;
var ts;
var ava;

module.exports = function (pipelines) {

    pipelines["build"] = [
        glob({ basePath: "src" }, "**/*.ts"),
        ts(),
        debounce(3000),
        write("lib"),
        // ava({files: "test/*.js", source: "src/**/*.ts", verbose: true})
        ava({files: "test/*.js", verbose: true})
    ];
};