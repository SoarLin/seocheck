'use strict';

const fs = require('fs');
const htmlparser = require('htmlparser2');
const stream = require('stream');

class SEOChecker {
  constructor(options) {
    this.input = (options !== undefined && options.input) ? options.input : false;
    this.output = (options !== undefined && options.output) ? options.output : 'console';
    this.maxStrongTags = (options !== undefined && options.maxStrongTags) ? options.maxStrongTags : 15;
    this.rules = (options !== undefined && options.rules) ? options.rules : [];

    this.inputType = this.detectInputType();
    this.outputType = this.detectOutputType();
    // for output to file
    this.outputFile = undefined;
    // for read stream pipe destination
    this.writeStream = undefined;

    this.init();
  }

  init() {
    /*
     * if input type is readable stream, need to create temp write stream
     * for accept read stream pipe data
     */
    if (this.inputType === 'stream') {
      this.writeStream = this.createTempWriteStream();

      // read stream pipe() will trigger 'data' event
      this.input.on('data', (chunk) => {
        this.doCheck(chunk);
      });

      // if no data, close write stream and remove temp
      this.input.on('end', () => {
        this.writeStream.end();
        fs.unlink('temp');
      });
    }

    /*
     * if output type is a file, need to create output file for write out.
     */
    if (this.outputType === 'file') {
      let filepath = this.outputFilePath(this.output);
      this.clearOldOutputFile(filepath)
        .then(() => {
          this.outputFile = fs.createWriteStream(filepath, { flags: 'a' });
        })
        .catch((err) => {
          process.stdout.write(err.message);
        });
    }
  }

  get writer() {
    if (this.writeStream === undefined) {
      this.writeStream = this.createTempWriteStream();
    }
    return this.writeStream;
  }

  createTempWriteStream() {
    return fs.createWriteStream('temp');
  }

  detectInputType() {
    if (
      typeof this.input === 'string' &&
      (this.input.endsWith('html') || this.input.endsWith('htm'))
    ) {
      return 'htmlfile';
    } else if (this.input instanceof stream.Readable) {
      return 'stream';
    } else {
      throw new Error('Unacceptable input type');
    }
  }

  detectOutputType() {
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

  outputFilePath(path) {
    if (path.startsWith('/')) {
      return path;
    } else {
      return __dirname + '/' + path;
    }
  }

  clearOldOutputFile(filepath) {
    if (fs.existsSync(filepath)) {
      return new Promise((resolve, reject) => {
        fs.unlink(filepath, (err) => {
          if (err) {
            reject('no such file');
          }
          resolve();
        });
      });
    } else {
      return new Promise((resolve) => {
        resolve();
      });
    }
  }

  writeFile(text) {
    if (this.outputFile === undefined) {
      let filepath = this.outputFilePath(this.output);

      this.clearOldOutputFile(filepath)
        .then(() => {
          this.outputFile = fs.createWriteStream(filepath, { flags: 'a' });
          this.outputFile.write(text + '\r\n');
        })
        .catch((err) => {
          throw err;
        });
    } else {
      this.outputFile.write(text + '\r\n');
    }
  }

  printOutput(text) {
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

  doCheck(raw) {
    let result = '';
    this.raw = raw;
    for (let i = 0, max = this.rules.length; i < max; i++) {
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

  check() {
    if (this.inputType === 'htmlfile') {
      let newPromise = new Promise((resolve, reject) => {
        fs.readFile(this.input, (err, data) => {
          if (err) {
            reject(err);
          }
          resolve(data);
        });
      });

      newPromise
        .then((data) => {
          this.doCheck(data.toString());
        })
        .catch((err) => {
          throw err;
        });
      return newPromise;
    } else {
      // input is readable stream
      // use 'data' event to check chunk data
    }
  }

  addRules(rules) {
    if (Array.isArray(rules)) {
      this.rules.concat(rules);
    } else {
      this.rules.push(rules);
    }
    return this.rules.length;
  }

  countTagAndAttr(raw, tagName, attrName = '') {
    let tagCount = 0,
      attrCount = 0;
    let parser = new htmlparser.Parser(
      {
        onopentag: function(name, attritube) {
          if (name === tagName) {
            tagCount++;
            if (attrName !== '' && attritube[attrName]) {
              attrCount++;
            }
          }
        }
      },
      { decodeEntities: true }
    );
    parser.write(raw);
    parser.end();
    return {
      tag: tagCount,
      attr: attrCount
    };
  }

  checkTagInHead(raw, tagName, metaNameValue = '') {
    let inHead = false,
      result = false;
    let parser = new htmlparser.Parser(
      {
        onopentag: function(name, attritube) {
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
        onclosetag: function(name) {
          if (name === 'head') {
            inHead = false;
          }
        }
      },
      { decodeEntities: true }
    );
    parser.write(raw);
    parser.end();

    return result;
  }

  static imgShouldContainAltAttr() {
    let result = this.countTagAndAttr(this.raw, 'img', 'alt');
    let count = result.tag - result.attr;

    if (count > 0) {
      return `There are ${count} <img> without alt attritube`;
    }
    return false;
  }

  static linkShouldContainRelAttr() {
    let result = this.countTagAndAttr(this.raw, 'a', 'rel');
    let count = result.tag - result.attr;

    if (count > 0) {
      return `There are ${count} <a> without rel attritube`;
    }
    return false;
  }

  static headShouldContainMetaAndTitle() {
    let result = false;
    let meta = ['descriptions', 'keywords'];

    if (this.checkTagInHead(this.raw, 'title') === false) {
      result = 'This HTML without <title> tag';
    }

    for (let i = 0, max = meta.length; i < max; i++) {
      if (this.checkTagInHead(this.raw, 'meta', meta[i]) === false) {
        if (result !== false) {
          result += '\r\n';
        }
        result = '' + `This HTML without <meta name="${meta[i]}"> tag`;
      }
    }

    return result;
  }

  static bodySholdNotContainTooMoreStrong() {
    let count = this.countTagAndAttr(this.raw, 'strong');

    if (count.tag > this.maxStrongTags) {
      return `This HTML have more than ${this.maxStrongTags} <strong> tag`;
    }
    return false;
  }

  static bodySholdNotContainMoreThanOneH1() {
    let count = this.countTagAndAttr(this.raw, 'h1');

    if (count.tag > 1) {
      return 'This HTML have more than one <h1> tag';
    }
    return false;
  }
}

module.exports = SEOChecker;
