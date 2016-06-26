var fs = require('fs');
var path = require('path');

module.exports = derivePkg;

function derivePkg(baseDir, opts) {
  if (!opts.outDir) {
    throw Error('Error: No output directory specified.');
  }

  var baseDir = opts.baseDir || '.';

  var pkgPath = path.resolve(baseDir, 'package.json');
  var pkg = require(pkgPath);

  delete pkg.devDependencies;
  if (opts.version) {
    pkg.version = opts.version;
  }
  if (opts.name) {
    pkg.name = opts.name;
  }
  if (pkg.main) {
    pkg.main = rebasePaths(pkg.main, opts.outDir);
  }
  if (pkg.bin) {
    pkg.bin = rebasePaths(pkg.bin, opts.outDir);
  }
  if (pkg.browser) {
    pkg.browser = rebasePaths(pkg.browser, opts.outDir);
  }

  var destPkgPath = path.resolve(opts.outDir, 'package.json');
  writePkg(pkg, destPkgPath);

  var readmePath = path.resolve(baseDir, 'README.md');
  var destReadmePath = path.resolve(opts.outDir, 'README.md');

  fs.createReadStream(readmePath).pipe(fs.createWriteStream(destReadmePath));
}

function writePkg(pkg, dest) {
  fs.writeFileSync(dest, JSON.stringify(pkg, null, 2));
}

function rebasePaths(entry, outDir) {
  if (typeof entry === 'string') {
    return path.relative(outDir, entry);
  } else if (typeof entry === 'object') {
    return Object.keys(entry).reduce(function(acc, key) {
      var val = entry[key];
      acc[key] = path.relative(outDir, val);
      return acc;
    }, {});
  }
}
