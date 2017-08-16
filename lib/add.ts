import * as through from 'through2';
import * as gutil from 'gulp-util';
import * as File from 'vinyl';
import { exec } from 'child_process';
const escape = require('any-shell-escape');



module.exports = function (opt) {
  if (!opt) opt = {};
  if (!opt.args) opt.args = ' ';

  let paths: string[] = [];
  let files: File[] = [];
  let fileCwd = process.cwd();

  const write = (file: File, enc, cb) => {
    paths.push(file.path);
    files.push(file);
    fileCwd = file.cwd;
    cb();
  };

  var flush = function(cb) {
    var cwd = opt.cwd || fileCwd;

    var cmd = 'git add ' + escape(paths) + ' ' + opt.args;
    var that = this;
    var maxBuffer = opt.maxBuffer || 200 * 1024;

    exec(cmd, {cwd: cwd, maxBuffer: maxBuffer}, function(err, stdout, stderr) {
      if (err) cb(err);
      if (!opt.quiet) gutil.log(stdout, stderr);
      files.forEach(that.push.bind(that));
      that.emit('end');
      cb();
    });
  };

  return through.obj(write, flush);
};
