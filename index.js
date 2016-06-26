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
  if (opts.version) {
    pkg.version = opts.version;
  }
  if (opts.name) {
    pkg.name = opts.name;
  }

  var movedMain = path.relative(opts.outDir, pkg.main);

  pkg.main = movedMain;

  var destPkgPath = path.resolve(opts.outDir, 'package.json');
  fs.writeFileSync(destPkgPath, JSON.stringify(pkg, null, 2));

  var readmePath = path.resolve(baseDir, 'README.md');
  var destReadmePath = path.resolve(opts.outDir, 'README.md');

  fs.createReadStream(readmePath).pipe(fs.createWriteStream(destReadmePath));
}
