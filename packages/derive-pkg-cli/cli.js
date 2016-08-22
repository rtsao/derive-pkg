#!/usr/bin/env node

var derivePkg = require('derive-pkg');

var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    d: 'outDir',
    v: 'version',
    n: 'name'
  }
});

if (argv._.length > 1) {
  showUsage().on('end', function() {
    process.exit(1);
  });
}
else {
  derivePkg(argv._[0], argv);
}

function showUsage() {
  var fs = require('fs');
  var path = require('path');
  var usage = fs.createReadStream(path.join(__dirname, 'usage.txt'));
  usage.pipe(process.stdout);
  return usage;
}
