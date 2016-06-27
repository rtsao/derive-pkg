'use strict';

var test = require('tape');
var mock = require('mock-fs');
var fs = require('fs');

var api = require('../');

test('test error thrown', function (t) {
  mock({
    'package.json': '{}',
    'README.md': 'a readme',
    'lib': {}
  });
  api({outDir: 'lib'}, function() {
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
    mock.restore();
  });
  t.end();
});
