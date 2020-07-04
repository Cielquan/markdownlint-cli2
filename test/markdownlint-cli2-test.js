// @ts-check

"use strict";

const fs = require("fs");
const path = require("path");
const execa = require("execa");
const tape = require("tape");
require("tape-player");

function testCase(name, args, exitCode, cwd) {
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
      ),
      fs.promises.readFile(
        path.join(__dirname, `${name}.stderr`),
        "utf8"
      )
    ])
    .then((results) => {
      const [ child, stdout, stderr ] = results;
      test.equal(child.exitCode, exitCode);
      test.equal(child.stdout, stdout);
      test.equal(child.stderr, stderr);
    });
  });
}

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
  "markdownlint-json",
  [ "**/*.md" ],
  1
);

testCase(
  "markdownlint-cli2-jsonc",
  [ "**/*.md" ],
  1
);
