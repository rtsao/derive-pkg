var derivePkgCore = require('derive-pkg-core');
var rebasePaths = require('./rebase-paths');

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

  var transformPkg = function(pkg) {
    delete pkg.devDependencies;
    delete pkg.scripts;
    // Derived packages are intended for publishing; we can safely strip
    // their "private" key
    delete pkg.private;
    if (opts.name) {
      pkg.name = opts.name;
    }
    if (opts.version) {
      pkg.version = opts.version;
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
    return pkg;
  };

  derivePkgCore({
    srcDir: baseDir,
    destDir: opts.outDir,
    transformFn: transformPkg
  }, callback);
}
