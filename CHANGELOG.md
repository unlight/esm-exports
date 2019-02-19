## [3.0.1](https://github.com/unlight/esm-exports/compare/v3.0.0...v3.0.1) (2019-02-19)


### Bug Fixes

* Bump version ([58a8c02](https://github.com/unlight/esm-exports/commit/58a8c02))

# [3.0.0](https://github.com/unlight/esm-exports/compare/v2.3.1...v3.0.0) (2019-02-19)


### Bug Fixes

* Always collect export in declare module/names blocks ([0b8f307](https://github.com/unlight/esm-exports/commit/0b8f307))
* Fixed tslint notes ([cfd678e](https://github.com/unlight/esm-exports/commit/cfd678e))
* pkg-dir added to dependency ([4573ed6](https://github.com/unlight/esm-exports/commit/4573ed6))
* Updated TypeScript to version 3 ([155cdbc](https://github.com/unlight/esm-exports/commit/155cdbc))


### chore

* Updated dependencies ([df1145e](https://github.com/unlight/esm-exports/commit/df1145e))


### Code Refactoring

* Renamed parse function to main ([c495275](https://github.com/unlight/esm-exports/commit/c495275))


### BREAKING CHANGES

* TypeScript 3
* Renamed parse function to main
* Declared items in declare module x construction considered always as exported

# [3.0.0](https://github.com/unlight/esm-exports/compare/v2.3.1...v3.0.0) (2019-02-13)


### Bug Fixes

* Always collect export in declare module/names blocks ([0b8f307](https://github.com/unlight/esm-exports/commit/0b8f307))
* pkg-dir added to dependency ([4573ed6](https://github.com/unlight/esm-exports/commit/4573ed6))
* Updated TypeScript to version 3 ([155cdbc](https://github.com/unlight/esm-exports/commit/155cdbc))


### BREAKING CHANGES

* Declared items in declare module x construction considered always as exported

<a name="2.1.0"></a>
# [2.1.0](https://github.com/unlight/esm-exports/compare/v2.0.3...v2.1.0) (2018-02-22)


### Features

* **core:** Can detect export default identifier ([6c537a1](https://github.com/unlight/esm-exports/commit/6c537a1))



<a name="2.0.3"></a>
## [2.0.3](https://github.com/unlight/typescript-exports/compare/v2.0.2...v2.0.3) (2017-12-13)


### Bug Fixes

* **file:** Prevent emit error when try to read file ([08c1390](https://github.com/unlight/typescript-exports/commit/08c1390))



<a name="2.0.2"></a>
## [2.0.2](https://github.com/unlight/typescript-exports/compare/v2.0.1...v2.0.2) (2017-12-12)


### Bug Fixes

* **parse:** Possible fix ([224a4f3](https://github.com/unlight/typescript-exports/commit/224a4f3))



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
