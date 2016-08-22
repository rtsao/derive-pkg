var fs = require('fs');
var path = require('path');
var parallel = require('run-parallel');

module.exports = derivePkg;

function derivePkg(opts, callback) {
  parallel([
    function(cb) {
      copyPackageJson(opts.srcDir, opts.destDir, opts.transformFn, cb);
    },
    function(cb) {
      copyPackageMeta(opts.srcDir, opts.destDir, cb);
    }
  ], callback);
}

function copyPackageJson(srcDir, destDir, transformFn, cb) {
  var srcPath = path.resolve(srcDir, 'package.json');
  var destPath = path.resolve(destDir, 'package.json');
  fs.readFile(srcPath, function(err, data) {
    if (err) {
      return cb('Could not read package.json');
    }
    try {
      var pkg = JSON.parse(data);
    } catch (e) {
      return cb('Error parsing package.json');
    }
    writePkg(transformFn ? transformFn(pkg) : pkg, destPath, cb);
  });
}

function writePkg(pkg, dest, cb) {
  fs.writeFile(dest, JSON.stringify(pkg, null, 2), 'utf8', cb);
}

function copyPackageMeta(srcDir, destDir, cb) {
  var callbacks = [];
  fs.readdir(srcDir, function(err, files) {
    files.forEach(function(file) {
      var absPath = path.join(srcDir, file);
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
