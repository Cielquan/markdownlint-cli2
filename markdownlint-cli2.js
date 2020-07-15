#!/usr/bin/env node

// @ts-check

"use strict";

// Requires
const fs = require("fs").promises;
const path = require("path");
const util = require("util");
const globby = require("globby");
const markdownlint = require("markdownlint");

// Variables
const markdownlintPromise = util.promisify(markdownlint);
const markdownlintReadConfigPromise = util.promisify(markdownlint.readConfig);

// Parse JSONC text
const jsoncParse = (text) => JSON.parse(require("strip-json-comments")(text));

// Parse YAML text
const yamlParse = (text) => require("yaml").parse(text);

// Formats summary in the style of `markdownlint-cli`
const formatMarkdownlintCli = (summary) => {
  for (const errorInfo of summary) {
    const { fileName, lineNumber, ruleNames, ruleDescription, errorDetail,
      errorContext, errorRange } = errorInfo;
    const ruleName = ruleNames.join("/");
    const description = ruleDescription +
          (errorDetail ? ` [${errorDetail}]` : "") +
          (errorContext ? ` [Context: "${errorContext}"]` : "");
    const column = (errorRange && errorRange[0]) || 0;
    const columnText = column ? `:${column}` : "";
    console.error(
      `${fileName}:${lineNumber}${columnText} ${ruleName} ${description}`
    );
  }
};

// Main function
(async () => {
  // Output help for missing arguments
  const globPatterns =
    process.
      argv.
      slice(2).
      map((glob) => glob.replace(/^#/u, "!"));
  if (globPatterns.length === 0) {
    const { name, version, author, homepage } = require("./package.json");
    /* eslint-disable max-len */
    console.log(`${name} version ${version} by ${author.name} (${author.url})
${homepage}

Syntax: ${name} glob0 [glob1] [...] [globN]

Cross-platform compatibility:

- UNIX and Windows shells expand globs according to different rules, so quoting glob arguments is recommended
- Shells that expand globs do not support negated patterns (!node_modules), so quoting negated globs is required
- Some Windows shells do not handle single-quoted (') arguments correctly, so double-quotes (") are recommended
- Some UNIX shells handle exclamation (!) in double-quotes specially, so hashtag (#) is recommended for negated globs
- Some shells use backslash (\\) to escape special characters, so forward slash (/) is the recommended path separator

Therefore, the most compatible syntax for cross-platform support:
${name} "**/*.md" "#node_modules"`
    );
    /* eslint-enable max-len */
    process.exitCode = 1;
  }

  // Enumerate glob patterns and build directory info list
  const tasks = [];
  const dirToDirInfo = {};
  const readConfig = (dir, name, otherwise) => {
    const file = path.join(dir, name);
    return () => fs.access(file).
      then(
        // @ts-ignore
        () => markdownlintReadConfigPromise(file, [ jsoncParse, yamlParse ]),
        otherwise
      );
  };
  const getAndProcessDirInfo = (dir, func) => {
    let dirInfo = dirToDirInfo[dir];
    if (!dirInfo) {
      dirInfo = {
        dir,
        "parent": null,
        "files": [],
        "markdownlintConfig": null,
        "markdownlintOptions": null
      };
      dirToDirInfo[dir] = dirInfo;
      const markdownlintCli2Jsonc = path.join(dir, ".markdownlint-cli2.jsonc");
      tasks.push(
        fs.access(markdownlintCli2Jsonc).
          then(
            () => fs.readFile(markdownlintCli2Jsonc, "utf8").then(jsoncParse),
            () => null
          ).
          then((options) => {
            dirInfo.markdownlintOptions = options;
          })
      );
      const readConfigs =
        readConfig(
          dir,
          ".markdownlint.json",
          readConfig(
            dir,
            ".markdownlint.jsonc",
            readConfig(
              dir,
              ".markdownlint.yaml",
              readConfig(
                dir,
                ".markdownlint.yml",
                () => null
              )
            )
          )
        );
      tasks.push(
        readConfigs().
          then((config) => {
            dirInfo.markdownlintConfig = config;
          })
      );
    }
    func(dirInfo);
    return dirInfo;
  };
  for await (const file of globby.stream(globPatterns)) {
    // @ts-ignore
    let dir = path.dirname(file);
    let lastDir = dir;
    let lastDirInfo = getAndProcessDirInfo(dir, (dirInfo) => {
      dirInfo.files.push(file);
    });
    while ((dir = path.dirname(dir)) && (dir !== lastDir)) {
      lastDir = dir;
      // eslint-disable-next-line no-loop-func
      lastDirInfo = getAndProcessDirInfo(dir, (dirInfo) => {
        lastDirInfo.parent = dirInfo;
      });
    }
  }
  await Promise.all(tasks);
  tasks.length = 0;

  // Merge file lists with identical configuration
  const dirs = Object.keys(dirToDirInfo);
  dirs.sort((a, b) => b.length - a.length);
  const dirInfos = [];
  const noConfigDirInfo =
    (dirInfo) => (
      dirInfo.parent &&
      !dirInfo.markdownlintConfig &&
      !dirInfo.markdownlintOptions
    );
  dirs.forEach((dir) => {
    const dirInfo = dirToDirInfo[dir];
    if (dirInfo.parent && noConfigDirInfo(dirInfo)) {
      dirInfo.parent.files.push(...dirInfo.files);
      dirToDirInfo[dir] = null;
    } else {
      dirInfos.push(dirInfo);
    }
  });
  dirInfos.forEach((dirInfo) => {
    while (dirInfo.parent && !dirToDirInfo[dirInfo.parent.dir]) {
      dirInfo.parent = dirInfo.parent.parent;
    }
  });

  // Verify dirInfos is simplified
  // if (dirInfos.filter((di) => !di.files.length).length) {
  //   throw new Error("No files");
  // }
  // if (dirInfos.filter(
  //   (di) => di.parent && !dirInfos.includes(di.parent)).length
  // ) {
  //   throw new Error("Extra parent");
  // }

  // Merge configuration by inheritance
  dirInfos.forEach((dirInfo) => {
    let markdownlintOptions = dirInfo.markdownlintOptions || {};
    let parent = dirInfo;
    // eslint-disable-next-line prefer-destructuring
    while ((parent = parent.parent)) {
      if (parent.markdownlintOptions) {
        const config = {
          ...parent.markdownlintOptions.config,
          ...markdownlintOptions.config
        };
        markdownlintOptions = {
          ...parent.markdownlintOptions,
          ...markdownlintOptions,
          config
        };
      }
    }
    dirInfo.markdownlintOptions = markdownlintOptions;
  });

  // Lint each list of files
  dirInfos.forEach((dirInfo) => {
    const options = {
      "config": dirInfo.markdownlintOptions.config,
      "files": dirInfo.files,
      "resultVersion": 3
    };
    if (dirInfo.markdownlintConfig) {
      options.config = dirInfo.markdownlintConfig;
    }
    const task = markdownlintPromise(options);
    tasks.push(task);
  });
  const taskResults = await Promise.all(tasks);
  tasks.length = 0;

  // Create summary of results
  const summary = [];
  let counter = 0;
  for (const results of taskResults) {
    for (const fileName in results) {
      const errorInfos = results[fileName];
      if (Array.isArray(errorInfos)) {
        for (const errorInfo of errorInfos) {
          summary.push({
            "fileName": path.posix.relative("", fileName),
            ...errorInfo,
            counter
          });
          counter++;
        }
      }
    }
  }
  summary.sort((a, b) => (
    a.fileName.localeCompare(b.fileName) ||
    (a.lineNumber - b.lineNumber) ||
    a.ruleNames[0].localeCompare(b.ruleNames[0]) ||
    (a.counter - b.counter)
  ));

  // Output summary
  if (summary.length > 0) {
    formatMarkdownlintCli(summary);
    process.exitCode = 1;
  }
})();
