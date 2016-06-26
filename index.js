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

  copyPackageMeta(baseDir, opts.outDir);
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

function copyPackageMeta(baseDir, destDir) {
  fs.readdir(baseDir, function(err, files) {
    files.forEach(function(file) {
      var absPath = path.join(baseDir, file);
      fs.stat(absPath, function(err, stats) {
        if (stats.isFile() && isPackageMeta(file)) {
          fs.createReadStream(absPath)
            .pipe(fs.createWriteStream(path.join(destDir, file)));
        }
      });
    });
  });
}

/*
 * Returns whether file cannot be ignored by npm, and hence
 * should be published to npm. Adapted from:
 * https://github.com/npm/npm/blob/master/lib/utils/tar.js
 */
function isPackageMeta(file) {
  if (file.match(/^readme(\.[^\.]*)$/i)) {
    return true;
  }
  if (file.match(/^(license|licence)(\.[^\.]*)?$/i)) {
    return true;
  }
  if (file.match(/^(notice)(\.[^\.]*)?$/i)) {
    return true;
  }
  if (file.match(/^(changes|changelog|history)(\.[^\.]*)?$/i)) {
    return true;
  }
}
