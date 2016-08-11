var fs = require('fs');
var path = require('path');
var parallel = require('run-parallel');

module.exports = derivePkg;

function derivePkg(baseDir, opts, callback) {
  if (typeof baseDir === 'undefined') {
    baseDir = '.';
  } else if (typeof baseDir === 'object') {
    callback = opts;
    opts = baseDir;
    baseDir = '.';
  }
  if (!opts.outDir) {
    throw Error('Error: No output directory specified.');
  }

  parallel([
    function (cb) {
      copyPackageJson(baseDir, opts.outDir, opts.name, opts.version, cb);
    },
    function (cb) {
      copyPackageMeta(baseDir, opts.outDir, cb);
    }
  ], callback);
}

function copyPackageJson(baseDir, destDir, name, version, callback) {
  var srcPath = path.resolve(baseDir, 'package.json');
  var destPath = path.resolve(destDir, 'package.json');
  fs.readFile(srcPath, function(err, data) {
    if (err) {
      throw Error('Could not read package.json');
    }
    try {
      var pkg = JSON.parse(data);
    } catch (e) {
      return callback('Error parsing package.json');
    }
    writePkg(transformPackageJson(pkg, destDir, name, version), destPath, callback);
  });
}

function transformPackageJson(pkg, outDir, name, version) {
  delete pkg.devDependencies;
  if (name) {
    pkg.name = name;
  }
  if (version) {
    pkg.version = version;
  }
  if (pkg.main) {
    pkg.main = rebasePaths(pkg.main, outDir);
  }
  if (pkg.bin) {
    pkg.bin = rebasePaths(pkg.bin, outDir);
  }
  if (pkg.browser) {
    pkg.browser = rebasePaths(pkg.browser, outDir);
  }
  return pkg;
}

function writePkg(pkg, dest, callback) {
  fs.writeFile(dest, JSON.stringify(pkg, null, 2), 'utf8', callback);
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

function copyPackageMeta(baseDir, destDir, cb) {
  var callbacks = [];
  fs.readdir(baseDir, function(err, files) {
    files.forEach(function(file) {
      var absPath = path.join(baseDir, file);
      callbacks.push(function(done) {
        fs.stat(absPath, function(err, stats) {
          if (stats.isFile() && isPackageMeta(file)) {
            var out = fs.createWriteStream(path.join(destDir, file));
              out.on('finish', done);
            fs.createReadStream(absPath).pipe(out);
          } else {
            done();
          }
        });
      });
    });
    parallel(callbacks, cb);
  });
}

/*
 * Returns true if a given file cannot be npmignored and hence should be
 * copied from the base directory and published to npm. Adapted from:
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
