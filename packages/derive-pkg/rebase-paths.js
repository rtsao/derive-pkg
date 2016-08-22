var path = require('path');

module.exports = rebasePaths;

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
