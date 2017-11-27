# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.0.1"></a>
## [2.0.1](https://github.com/unlight/typescript-exports/compare/v2.0.0...v2.0.1) (2017-11-27)


### Bug Fixes

* **parse:** Parse types definitions for commonjs ([a298f31](https://github.com/unlight/typescript-exports/commit/a298f31))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/unlight/typescript-exports/compare/v1.2.0...v2.0.0) (2017-11-21)


### Bug Fixes

* **parse:** Removed duplicated entries ([8811669](https://github.com/unlight/typescript-exports/commit/8811669)), closes [#2](https://github.com/unlight/typescript-exports/issues/2)


### Features

* **benchmark:** Run benchmarks between two commits ([8ecf3b2](https://github.com/unlight/typescript-exports/commit/8ecf3b2))
* **entry:** Keep only module or filepath ([968c9f8](https://github.com/unlight/typescript-exports/commit/968c9f8))


### Performance Improvements

* **parse:** Check depth is set to 3 ([24c320f](https://github.com/unlight/typescript-exports/commit/24c320f))


### BREAKING CHANGES

* **entry:** Entry class do not contains filepath property if module is defined



<a name="1.2.0"></a>
# [1.2.0](https://github.com/unlight/typescript-exports/compare/v1.1.0-alpha.6...v1.2.0) (2017-11-17)


### Features

* Can parse some commonjs modules ([1c8efe5](https://github.com/unlight/typescript-exports/commit/1c8efe5))



<a name="0.8.5"></a>
## [0.8.5](https://github.com/unlight/typescript-exports/compare/v0.8.4...v0.8.5) (2017-11-03)



<a name="0.8.4"></a>
## [0.8.4](https://github.com/unlight/typescript-exports/compare/v0.8.3...v0.8.4) (2017-10-31)



<a name="1.1.0-alpha.6"></a>
# [1.1.0-alpha.6](https://github.com/unlight/typescript-exports/compare/v1.1.0-alpha.5...v1.1.0-alpha.6) (2017-11-16)


### Bug Fixes

* Use module options on initial parse ([6ff64a1](https://github.com/unlight/typescript-exports/commit/6ff64a1))



<a name="1.1.0-alpha.5"></a>
# [1.1.0-alpha.5](https://github.com/unlight/typescript-exports/compare/v1.1.0-alpha.3...v1.1.0-alpha.5) (2017-11-15)


### Bug Fixes

* Ponyfill for Object.values ([cb7cabe](https://github.com/unlight/typescript-exports/commit/cb7cabe))



<a name="1.1.0-alpha.4"></a>
# [1.1.0-alpha.4](https://github.com/unlight/typescript-exports/compare/v1.1.0-alpha.3...v1.1.0-alpha.4) (2017-11-14)


### Bug Fixes

* Ponyfill for Object.values ([cb7cabe](https://github.com/unlight/typescript-exports/commit/cb7cabe))



<a name="1.1.0-alpha.3"></a>
# [1.1.0-alpha.3](https://github.com/unlight/typescript-exports/compare/v1.1.0-alpha.2...v1.1.0-alpha.3) (2017-11-13)


### Bug Fixes

* Ignore node_modules ([dff6187](https://github.com/unlight/typescript-exports/commit/dff6187))

<a name="1.1.0-alpha.1"></a>
# [1.1.0-alpha.1](https://github.com/unlight/typescript-exports/compare/v0.8.3...v1.1.0-alpha.1) (2017-11-13)


### Bug Fixes

* Parse inner modules by checking package.json ([256bd91](https://github.com/unlight/typescript-exports/commit/256bd91))
* **npm:** Published sources ([83aa340](https://github.com/unlight/typescript-exports/commit/83aa340))


### Features

* Do not parse similar files .ts .d.ts ([bb324ec](https://github.com/unlight/typescript-exports/commit/bb324ec))



<a name="1.1.0-alpha.0"></a>
# [1.1.0-alpha.0](https://github.com/unlight/typescript-exports/compare/v0.8.3...v1.1.0-alpha.0) (2017-11-13)


### Bug Fixes

* Parse inner modules by checking package.json ([256bd91](https://github.com/unlight/typescript-exports/commit/256bd91))


### Features

* Do not parse similar files .ts .d.ts ([bb324ec](https://github.com/unlight/typescript-exports/commit/bb324ec))
