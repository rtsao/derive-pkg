# derive-pkg

A helper utility for publishing transpiled code to npm

#### What is this for?

When building libraries with Babel and publishing transpiled code, the standard convention is to place source code into `src` and transpiled code into `lib` or `dist`. This makes consuming individual submodules less convenient because they don't exist at the root of the package, e.g. `require('my-module/lib/a-submodule.js')`.

This utlity derives a `package.json` from your root and places it into your build directory so you can publish it.

## Install

```
npm install derive-pkg --save-dev
```

## Quick Example

```
babel-cli src -o lib
derive-pkg -o lib
npm publish lib
```

## Usage

```
Usage: derive-pkg [directory] [options]

Options:
      directory   The base directory containing the package.json (defualt: ".")

  --out-dir, -d   The output directory for the derived package.json

     --name, -n   Override the name field of the derived package.json

  --version, -v   Override the version field of the derived package.json
```
