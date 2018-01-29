'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var htmlparser = require('htmlparser2');

var SEOChecker = function () {
  function SEOChecker(options) {
    _classCallCheck(this, SEOChecker);

    this.input = options.input;
    this.output = options.output || 'console';
    this.maxStrongTags = options.maxStrongTags || 15;
    this.rules = options.rules || [];

    this.inputType = this.detectInputType();
    this.outputType = this.detectOutputType();
    // for output to file
    this.outputFile = undefined;
    // for read stream pipe destination
    this.writeStream = undefined;
  }

  _createClass(SEOChecker, [{
    key: 'createTempWriteStream',
    value: function createTempWriteStream() {
      return fs.createWriteStream('temp');
    }
  }, {
    key: 'detectInputType',
    value: function detectInputType() {
      var _this = this;

      if (typeof this.input === 'string' && (this.input.endsWith('html') || this.input.endsWith('htm'))) {
        return 'htmlfile';
      } else {
        this.writeStream = this.createTempWriteStream();

        // read stream push() will trigger 'data' event
        this.input.on('data', function (chunk) {
          _this.doCheck(chunk);
        });

        // if no data, close write stream and remove temp
        this.input.on('end', function () {
          _this.writeStream.end();
          fs.unlink('temp');
        });

        return 'stream';
      }
    }
  }, {
    key: 'detectOutputType',
    value: function detectOutputType() {
      var _this2 = this;

      if (typeof this.output === 'string' && this.output === 'console') {
        return 'console';
      } else if (typeof this.output === 'string') {
        var filepath = this.outputFilePath(this.output);
        this.clearOldOutputFile(filepath).then(function () {
          _this2.outputFile = fs.createWriteStream(filepath, { flags: 'a' });
        }).catch(function (err) {
          process.stdout.write(err.message);
        });
        return 'file';
      } else {
        return 'stream';
      }
    }
  }, {
    key: 'outputFilePath',
    value: function outputFilePath(path) {
      if (path.startsWith('/')) {
        return path;
      } else {
        return __dirname + '/' + path;
      }
    }
  }, {
    key: 'clearOldOutputFile',
    value: function clearOldOutputFile(filepath) {
      if (fs.existsSync(filepath)) {
        return new Promise(function (resolve, reject) {
          fs.unlink(filepath, function (err) {
            if (err) {
              reject('no such file');
            }
            resolve();
          });
        });
      } else {
        return new Promise(function (resolve) {
          resolve();
        });
      }
    }
  }, {
    key: 'writeFile',
    value: function writeFile(text) {
      var _this3 = this;

      if (this.outputFile === undefined) {
        var filepath = this.outputFilePath(this.output);

        this.clearOldOutputFile(filepath).then(function () {
          _this3.outputFile = fs.createWriteStream(filepath, { flags: 'a' });
          _this3.outputFile.write(text + '\r\n');
        }).catch(function (err) {
          throw err;
        });
      } else {
        this.outputFile.write(text + '\r\n');
      }
    }
  }, {
    key: 'printOutput',
    value: function printOutput(text) {
      switch (this.outputType) {
        case 'console':
          process.stdout.write(text + '\r\n');
          break;
        case 'file':
          this.writeFile(text);
          break;
        case 'stream':
          this.output.write(text + '\r\n');
          break;
        default:
          break;
      }
    }
  }, {
    key: 'doCheck',
    value: function doCheck(raw) {
      var result = '';
      this.raw = raw;
      for (var i = 0, max = this.rules.length; i < max; i++) {
        result = this.rules[i].bind(this)();
        this.printOutput(result);
      }

      if (this.outputFile !== undefined) {
        this.outputFile.end();
      }
      if (this.outputType === 'stream') {
        this.output.end();
      }
    }
  }, {
    key: 'check',
    value: function check() {
      var _this4 = this;

      if (this.inputType === 'htmlfile') {
        var newPromise = new Promise(function (resolve, reject) {
          fs.readFile(_this4.input, function (err, data) {
            if (err) {
              reject(err);
            }
            resolve(data);
          });
        });

        newPromise.then(function (data) {
          _this4.doCheck(data.toString());
        }).catch(function (err) {
          throw err;
        });
      } else {
        // input is readable stream
        // use 'data' event to check chunk data
      }
    }
  }, {
    key: 'writer',
    get: function get() {
      if (this.writeStream === undefined) {
        this.writeStream = this.createTempWriteStream();
      }
      return this.writeStream;
    }
  }], [{
    key: 'imgShouldContainAltAttr',
    value: function imgShouldContainAltAttr() {
      var count = 0;
      var parser = new htmlparser.Parser({
        onopentag: function onopentag(name, attritube) {
          if (name === 'img') {
            count++;
            if (attritube.alt) {
              count--;
            }
          }
        }
      }, { decodeEntities: true });
      parser.write(this.raw);
      parser.end();

      return 'There are ' + count + ' <img> without alt attritube';
    }
  }, {
    key: 'linkShouldContainRelAttr',
    value: function linkShouldContainRelAttr() {
      var count = 0;
      var parser = new htmlparser.Parser({
        onopentag: function onopentag(name, attritube) {
          if (name === 'a') {
            count++;
            if (attritube.rel) {
              count--;
            }
          }
        }
      }, { decodeEntities: true });
      parser.write(this.raw);
      parser.end();
      return 'There are ' + count + ' <a> without rel attritube';
    }
  }, {
    key: 'headShouldContainMetaAndTitle',
    value: function headShouldContainMetaAndTitle() {
      var inHeader = false,
          hasTitle = false,
          result = '';
      var meta = [{ name: 'description', exist: false }, { name: 'keywords', exist: false }];
      var parser = new htmlparser.Parser({
        onopentag: function onopentag(name, attritube) {
          if (name === 'head') {
            inHeader = true;
          }
          if (inHeader) {
            if (name === 'title') {
              hasTitle = true;
            }
            for (var i = 0, max = meta.length; i < max; i++) {
              if (name === 'meta' && attritube.name === meta[i].name) {
                meta[i].exist = true;
              }
            }
          }
        },
        onclosetag: function onclosetag(tagname) {
          if (tagname === 'head') {
            inHeader = false;
          }
        }
      }, { decodeEntities: true });
      parser.write(this.raw);
      parser.end();

      if (hasTitle === false) {
        result += 'This HTML without <title> tag';
      }
      for (var i = 0, max = meta.length; i < max; i++) {
        if (meta[i].exist === false) {
          if (result !== '') {
            result += '\r\n';
          }
          result += 'This HTML without <meta name="' + meta[i].name + '"> tag';
        }
      }
      return result;
    }
  }, {
    key: 'bodySholdNotContainTooMoreStrong',
    value: function bodySholdNotContainTooMoreStrong() {
      var count = 0,
          result = '';
      var parser = new htmlparser.Parser({
        onopentagname: function onopentagname(name) {
          if (name === 'strong') {
            count++;
          }
        }
      }, { decodeEntities: true });
      parser.write(this.raw);
      parser.end();

      if (count > this.maxStrongTags) {
        result += 'This HTML have more than ' + this.maxStrongTags + ' <strong> tag';
      }

      return result;
    }
  }, {
    key: 'bodySholdNotContainMoreThanOneH1',
    value: function bodySholdNotContainMoreThanOneH1() {
      var count = 0,
          result = '';
      var parser = new htmlparser.Parser({
        onopentagname: function onopentagname(name) {
          if (name === 'h1') {
            count++;
          }
        }
      }, { decodeEntities: true });
      parser.write(this.raw);
      parser.end();

      if (count > 1) {
        result += 'This HTML have more than one <h1> tag';
      }
      return result;
    }
  }]);

  return SEOChecker;
}();

module.exports = SEOChecker;