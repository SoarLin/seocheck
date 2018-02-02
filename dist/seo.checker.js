'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var htmlparser = require('htmlparser2');
var stream = require('stream');

var SEOChecker = function () {
  function SEOChecker(options) {
    _classCallCheck(this, SEOChecker);

    this.input = options !== undefined && options.input ? options.input : false;
    this.output = options !== undefined && options.output ? options.output : 'console';
    this.maxStrongTags = options !== undefined && options.maxStrongTags ? options.maxStrongTags : 15;
    this.rules = options !== undefined && options.rules ? options.rules : [];

    this.inputType = this.detectInputType();
    this.outputType = this.detectOutputType();
    // for output to file
    this.outputFile = undefined;
    // for read stream pipe destination
    this.writeStream = undefined;

    this.init();
  }

  _createClass(SEOChecker, [{
    key: 'init',
    value: function init() {
      var _this = this;

      /*
       * if input type is readable stream, need to create temp write stream
       * for accept read stream pipe data
       */
      if (this.inputType === 'stream') {
        this.writeStream = this.createTempWriteStream();

        // read stream pipe() will trigger 'data' event
        this.input.on('data', function (chunk) {
          _this.doCheck(chunk);
        });

        // if no data, close write stream and remove temp
        this.input.on('end', function () {
          _this.writeStream.end();
          fs.unlink('temp');
        });
      }

      /*
       * if output type is a file, need to create output file for write out.
       */
      if (this.outputType === 'file') {
        var filepath = this.outputFilePath(this.output);
        this.clearOldOutputFile(filepath).then(function () {
          _this.outputFile = fs.createWriteStream(filepath, { flags: 'a' });
        }).catch(function (err) {
          process.stdout.write(err.message);
        });
      }
    }
  }, {
    key: 'createTempWriteStream',
    value: function createTempWriteStream() {
      return fs.createWriteStream('temp');
    }
  }, {
    key: 'detectInputType',
    value: function detectInputType() {
      if (typeof this.input === 'string' && (this.input.endsWith('html') || this.input.endsWith('htm'))) {
        return 'htmlfile';
      } else if (this.input instanceof stream.Readable) {
        return 'stream';
      } else {
        throw new Error('Unacceptable input type');
      }
    }
  }, {
    key: 'detectOutputType',
    value: function detectOutputType() {
      if (typeof this.output === 'string' && this.output === 'console') {
        return 'console';
      } else if (typeof this.output === 'string') {
        return 'file';
      } else if (this.output instanceof stream.Writable) {
        return 'stream';
      } else {
        throw 'Unacceptable output type';
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
      var _this2 = this;

      if (this.outputFile === undefined) {
        var filepath = this.outputFilePath(this.output);

        this.clearOldOutputFile(filepath).then(function () {
          _this2.outputFile = fs.createWriteStream(filepath, { flags: 'a' });
          _this2.outputFile.write(text + '\r\n');
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
        if (result) {
          this.printOutput(result);
        }
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
      var _this3 = this;

      if (this.inputType === 'htmlfile') {
        var newPromise = new Promise(function (resolve, reject) {
          fs.readFile(_this3.input, function (err, data) {
            if (err) {
              reject(err);
            }
            resolve(data);
          });
        });

        newPromise.then(function (data) {
          _this3.doCheck(data.toString());
        }).catch(function (err) {
          throw err;
        });
        return newPromise;
      } else {
        // input is readable stream
        // use 'data' event to check chunk data
      }
    }
  }, {
    key: 'addRules',
    value: function addRules(rules) {
      if (Array.isArray(rules)) {
        this.rules.concat(rules);
      } else {
        this.rules.push(rules);
      }
      return this.rules.length;
    }
  }, {
    key: 'countTagAndAttr',
    value: function countTagAndAttr(raw, tagName) {
      var attrName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

      var tagCount = 0,
          attrCount = 0;
      var parser = new htmlparser.Parser({
        onopentag: function onopentag(name, attritube) {
          if (name === tagName) {
            tagCount++;
            if (attrName !== '' && attritube[attrName]) {
              attrCount++;
            }
          }
        }
      }, { decodeEntities: true });
      parser.write(raw);
      parser.end();
      return {
        tag: tagCount,
        attr: attrCount
      };
    }
  }, {
    key: 'checkTagInHead',
    value: function checkTagInHead(raw, tagName) {
      var metaNameValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

      var inHead = false,
          result = false;
      var parser = new htmlparser.Parser({
        onopentag: function onopentag(name, attritube) {
          if (name === 'head') {
            inHead = true;
          }

          if (!inHead) {
            return false;
          }

          if (metaNameValue === '') {
            if (name === tagName) {
              result = true;
            }
          } else {
            if (name === tagName && attritube.name === metaNameValue) {
              result = true;
            }
          }
        },
        onclosetag: function onclosetag(name) {
          if (name === 'head') {
            inHead = false;
          }
        }
      }, { decodeEntities: true });
      parser.write(raw);
      parser.end();

      return result;
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
      var result = this.countTagAndAttr(this.raw, 'img', 'alt');
      var count = result.tag - result.attr;

      if (count > 0) {
        return 'There are ' + count + ' <img> without alt attritube';
      }
      return false;
    }
  }, {
    key: 'linkShouldContainRelAttr',
    value: function linkShouldContainRelAttr() {
      var result = this.countTagAndAttr(this.raw, 'a', 'rel');
      var count = result.tag - result.attr;

      if (count > 0) {
        return 'There are ' + count + ' <a> without rel attritube';
      }
      return false;
    }
  }, {
    key: 'headShouldContainMetaAndTitle',
    value: function headShouldContainMetaAndTitle() {
      var result = false;
      var meta = ['descriptions', 'keywords'];

      if (this.checkTagInHead(this.raw, 'title') === false) {
        result = 'This HTML without <title> tag';
      }

      for (var i = 0, max = meta.length; i < max; i++) {
        if (this.checkTagInHead(this.raw, 'meta', meta[i]) === false) {
          if (result !== false) {
            result += '\r\n';
          }
          result = '' + ('This HTML without <meta name="' + meta[i] + '"> tag');
        }
      }

      return result;
    }
  }, {
    key: 'bodySholdNotContainTooMoreStrong',
    value: function bodySholdNotContainTooMoreStrong() {
      var count = this.countTagAndAttr(this.raw, 'strong');

      if (count.tag > this.maxStrongTags) {
        return 'This HTML have more than ' + this.maxStrongTags + ' <strong> tag';
      }
      return false;
    }
  }, {
    key: 'bodySholdNotContainMoreThanOneH1',
    value: function bodySholdNotContainMoreThanOneH1() {
      var count = this.countTagAndAttr(this.raw, 'h1');

      if (count.tag > 1) {
        return 'This HTML have more than one <h1> tag';
      }
      return false;
    }
  }]);

  return SEOChecker;
}();

module.exports = SEOChecker;