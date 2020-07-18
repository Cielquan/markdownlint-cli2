// @ts-check

"use strict";

const fs = require("fs");
const path = require("path");
const execa = require("execa");
const tape = require("tape");
require("tape-player");

const crRe = /\r/gu;

const testCase = (name, args, exitCode, cwd) => {
  tape(name, (test) => {
    test.plan(3);
    Promise.all([
      execa.node(
        path.join(__dirname, "..", "markdownlint-cli2.js"),
        args,
        {
          "cwd": path.join(__dirname, `${cwd || name}`),
          "reject": false,
          "stripFinalNewline": false
        }
      ),
      fs.promises.readFile(
        path.join(__dirname, `${name}.stdout`),
        "utf8"
      ).catch(() => ""),
      fs.promises.readFile(
        path.join(__dirname, `${name}.stderr`),
        "utf8"
      ).catch(() => "")
    ]).then((results) => {
      const [ child, stdout, stderr ] = results;
      test.equal(child.exitCode, exitCode);
      test.equal(child.stdout, stdout.replace(crRe, ""));
      test.equal(child.stderr, stderr.replace(crRe, ""));
    });
  });
};

testCase(
  "no-arguments",
  [],
  1,
  "no-config"
);

testCase(
  "all-ok",
  [ "**/*.md", "**/*.markdown" ],
  0
);

testCase(
  "no-config",
  [ "**" ],
  1
);

testCase(
  "no-config-ignore",
  [ "**", "!dir" ],
  1,
  "no-config"
);

testCase(
  "no-config-unignore",
  [ "**", "!dir", "dir/subdir" ],
  1,
  "no-config"
);

testCase(
  "no-config-ignore-hash",
  [ "**", "#dir" ],
  1,
  "no-config"
);

testCase(
  "file-paths-as-args",
  [ "viewme.md", "./dir/subdir/info.md" ],
  1,
  "no-config"
);

testCase(
  "markdownlint-json",
  [ "**/*.md" ],
  1
);

testCase(
  "markdownlint-json-extends",
  [ "**/*.md" ],
  1
);

testCase(
  "markdownlint-jsonc",
  [ "**/*.md" ],
  1
);

testCase(
  "markdownlint-yaml",
  [ "**/*.md" ],
  1
);

testCase(
  "markdownlint-yml",
  [ "**/*.md" ],
  1
);

testCase(
  "markdownlint-json-yaml",
  [ "**/*.md" ],
  1
);

testCase(
  "markdownlint-cli2-jsonc",
  [ "**/*.md" ],
  1
);

testCase(
  "markdownlintignore",
  [ "**/*.md" ],
  1
);

testCase(
  "sibling-directory",
  [ "../markdownlint-json/**/*.md" ],
  1
);

testCase(
  "sibling-directory-options",
  [ "../no-config/**/*.md" ],
  1
);

tape("README.md", (test) => {
  test.plan(1);
  const markdownlintCli2 = require("../markdownlint-cli2.js");
  const uncalled = (msg) => test.fail(`message logged: ${msg}`);
  markdownlintCli2([ "README.md" ], uncalled, uncalled).
    then((exitCode) => test.equal(exitCode, 0));
});
