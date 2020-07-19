# markdownlint-cli2

> A fast, flexible, configuration-based command-line interface for linting
> Markdown/CommonMark files with the `markdownlint` library

[![npm version][npm-image]][npm-url]
[![CI Status][ci-image]][ci-url]
[![License][license-image]][license-url]

## Install

```shell
npm install markdownlint-cli2 --save-dev
```

## Overview

> **Note**: `markdownlint-cli2` is under development and is not yet as capable
> as `markdownlint-cli`.

- [`markdownlint`][markdownlint] is a library for linting [Markdown][markdown]/
  [CommonMark][commonmark] files on [Node.js][nodejs].
- [`markdownlint-cli`][markdownlint-cli] is a traditional command-line interface
  for `markdownlint`.
- [`markdownlint-cli2`][markdownlint-cli2] is a slightly unconventional
  command-line interface for `markdownlint`.
- `markdownlint-cli2` is configuration-based and prioritizes both speed and
  simplicity.
- `markdownlint-cli2` is mostly compatible with the features of
  `markdownlint-cli`.
- [`vscode-markdownlint`][vscode-markdownlint] is a `markdownlint` extension for
  the [Visual Studio Code editor][vscode].
- `markdownlint-cli2` is meant to work well in conjunction with
  `vscode-markdownlint`.

## Use

```text
markdownlint-cli2 version X.Y.Z by David Anson (https://dlaa.me/)
https://github.com/DavidAnson/markdownlint-cli2

Syntax: markdownlint-cli2 glob0 [glob1] [...] [globN]

Cross-platform compatibility:

- UNIX and Windows shells expand globs according to different rules, so quoting glob arguments is recommended
- Shells that expand globs do not support negated patterns (!node_modules), so quoting negated globs is required
- Some Windows shells do not handle single-quoted (') arguments correctly, so double-quotes (") are recommended
- Some UNIX shells handle exclamation (!) in double-quotes specially, so hashtag (#) is recommended for negated globs
- Some shells use backslash (\) to escape special characters, so forward slash (/) is the recommended path separator

Therefore, the most compatible syntax for cross-platform support:
markdownlint-cli2 "**/*.md" "#node_modules"
```

### Exit Codes

- `0`: Linting was successful and there were no errors
- `1`: Linting was successful and there were errors
- `2`: Linting was not completed due to a runtime issue

## Rule List

- See the [Rules / Aliases][markdownlint-rules-aliases] and
  [Tags][markdownlint-tags] sections of the `markdownlint` documentation.

## Configuration

- See the [Configuration][markdownlint-configuration] section of the
  `markdownlint` documentation for information about the inline comment syntax.

### `.markdownlint-cli2.jsonc`

- The format of this file type is a [JSONC][jsonc] object similar to the
  [`markdownlint` `options` object][markdownlint-options].
- Valid properties are:
  - `config`: The [`markdownlint` `config` object][markdownlint-config]
    - If a `jsonc`/`json`/`yaml`/`yml` file (see below) is present in the same
      directory, it overrides this value.
- Settings in this file apply to the directory it is in and all subdirectories
- Settings **merge with** those applied by any copies of this file in a parent
  directory.

### `.markdownlint.jsonc` / `.markdownlint.json`

- The format of this file type is a [JSON][json] or [JSONC][jsonc] object
  matching the [`markdownlint` `config` object][markdownlint-config].
- Settings in this file apply to the directory it is in and all subdirectories
- Settings **override** those applied by any copies of this file in a parent
  directory.
- If both files are present in the same directory, the `jsonc` version takes
  precedence.
- To merge the settings of these files or share configuration, use the `extends`
  property (documented above).
- Both extensions support comments in JSON.

### `.markdownlint.yaml` / `.markdownlint.yml`

- The format of this file type is a [YAML][yaml] object representing
  [`markdownlint`'s `config` object][markdownlint-config].
- Other details are the same as for `jsonc`/`json` files described above.
- If both files are present in the same directory, the `yaml` version takes
  precedence.
- If a `jsonc` or `json` file is present, it takes precedence according the
  rules above.

## History

- 0.0.2 - Initial release

<!-- markdownlint-disable line-length -->

[ci-image]: https://github.com/DavidAnson/markdownlint-cli2/workflows/ci/badge.svg?branch=main
[ci-url]: https://github.com/DavidAnson/markdownlint-cli2/actions?query=branch%3Amain
[commonmark]: https://commonmark.org/
[json]: https://wikipedia.org/wiki/JSON
[jsonc]: https://code.visualstudio.com/Docs/languages/json#_json-with-comments
[license-image]: https://img.shields.io/npm/l/markdownlint-cli2.svg
[license-url]: https://opensource.org/licenses/MIT
[markdown]: https://wikipedia.org/wiki/Markdown
[markdownlint]: https://github.com/DavidAnson/markdownlint
[markdownlint-config]: https://github.com/DavidAnson/markdownlint/blob/main/README.md#optionsconfig
[markdownlint-configuration]: https://github.com/DavidAnson/markdownlint/blob/main/README.md#configuration
[markdownlint-options]: https://github.com/DavidAnson/markdownlint/blob/main/README.md#options
[markdownlint-rules-aliases]: https://github.com/DavidAnson/markdownlint/blob/main/README.md#rules--aliases
[markdownlint-rules-tags]: https://github.com/DavidAnson/markdownlint/blob/main/README.md#tags
[markdownlint-cli]: https://github.com/igorshubovych/markdownlint-cli
[markdownlint-cli2]: https://github.com/DavidAnson/markdownlint-cli2
[nodejs]: https://nodejs.org/
[npm-image]: https://img.shields.io/npm/v/markdownlint-cli2.svg
[npm-url]: https://www.npmjs.com/package/markdownlint-cli2
[vscode]: https://code.visualstudio.com/
[vscode-markdownlint]: https://marketplace.visualstudio.com/items/DavidAnson.vscode-markdownlint
[yaml]: https://wikipedia.org/wiki/YAML
