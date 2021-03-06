'use strict';

var test = require('tape');
var mock = require('mock-fs');
var fs = require('fs');

var derivePkg = require('../');

test('test basic functionality', function (t) {
  mock({
    'package.json': '{}',
    'README.md': 'a readme',
    'LICENSE': 'a license',
    'NOTICE': 'a notice',
    'CHANGELOG': 'a changelog',
    'lib': {}
  });
  derivePkg({outDir: 'lib'}, function() {
    t.equal(
      fs.readFileSync('lib/package.json', 'utf8'),
      '{}',
      'JSON copied'
    );
    t.equal(
      fs.readFileSync('lib/README.md', 'utf8'),
      'a readme',
      'README.md copied'
    );
    t.equal(
      fs.readFileSync('lib/NOTICE', 'utf8'),
      'a notice',
      'notice copied'
    );
    t.equal(
      fs.readFileSync('lib/CHANGELOG', 'utf8'),
      'a changelog',
      'changelog copied'
    );
    mock.restore();
    t.end();
  });
});

test('test file rebasing', function (t) {
  var pkg = JSON.stringify({
    main: 'lib/index.js',
    bin: {
      main: 'lib/bin/main.js',
      other: 'lib/bin/other.js'
    }
  }, null, 2);

  var expected = JSON.stringify({
    main: 'index.js',
    bin: {
      main: 'bin/main.js',
      other: 'bin/other.js'
    }
  }, null, 2);

  mock({
    'package.json': pkg,
    'lib': {}
  });
  derivePkg({outDir: 'lib'}, function() {
    t.equal(
      fs.readFileSync('lib/package.json', 'utf8'),
      expected,
      'paths rebased'
    );
    mock.restore();
    t.end();
  });
});

test('test predefined fields are stripped', function (t) {
  var pkg = JSON.stringify({
    main: 'lib/index.js',
    devDependencies: {
      devDep: '1.0.0',
      otherDevDep: '2.0.0-beta0'
    },
    scripts: {
      test: 'echo test'
    },
    private: true
  }, null, 2);

  var expected = JSON.stringify({
    main: 'index.js'
  }, null, 2);

  mock({
    'package.json': pkg,
    'lib': {}
  });
  derivePkg({outDir: 'lib'}, function() {
    t.equal(
      fs.readFileSync('lib/package.json', 'utf8'),
      expected,
      'devDependencies, scripts, and private fields are stripped'
    );
    mock.restore();
    t.end();
  });
});
