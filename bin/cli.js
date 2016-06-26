#!/usr/bin/env node

var derivePkg = require('../index.js');

var opts = require('minimist')(process.argv.slice(2), {
  alias: {
    d: 'outDir'
  }
});
derivePkg(opts._[0], opts);
