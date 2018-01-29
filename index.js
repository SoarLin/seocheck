'use strict';

const fs = require('fs');
const htmlparser = require('htmlparser2');

class SEOChecker {
  constructor(options) {
    this.input = options.input;
    this.output = options.output || 'console';
    this.maxStrongTags = options.maxStrongTags || 15;
    this.rules = options.rules || [];

    this.inputType = this.detectInputType();
    this.outputType = this.detectOutputType();
    this.outputFile = undefined;
    // for read stream pipe destination
    this.writeStream = undefined;
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
    } else {
      this.writeStream = this.createTempWriteStream();

      // read stream push() will trigger 'data' event
      this.input.on('data', (chunk) => {
        this.doCheck(chunk);
      });

      // if no data, close write stream and remove temp
      this.input.on('end', () => {
        this.writeStream.end();
        fs.unlink('temp');
      });

      return 'stream';
    }
  }

  detectOutputType() {
    if (typeof this.output === 'string' && this.output === 'console') {
      return 'console';
    } else if (typeof this.output === 'string') {
      let filepath = this.outputFilePath(this.output);
      this.clearOldOutputFile(filepath).then(
        () => {
          this.outputFile = fs.createWriteStream(filepath, { flags: 'a' });
        },
        (err) => {}
      );
      return 'file';
    } else {
      return 'stream';
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
    return new Promise((resolve, reject) => {
      fs.unlink(filepath, (err) => {
        if (err) {
          // console.log('no such file');
        }
        resolve();
      });
    });
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
          console.error(err);
        });
    } else {
      this.outputFile.write(text + '\r\n');
    }
  }

  printOutput(text) {
    switch (this.outputType) {
      case 'console':
        console.log(text);
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
      this.printOutput(result);
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
          console.error(err);
        });
    } else {
      // input is readable stream
      // use 'data' event to check chunk data
    }
  }

  static imgShouldContainAltAttr() {
    let count = 0;
    let parser = new htmlparser.Parser(
      {
        onopentag: function(name, attritube) {
          if (name === 'img') {
            count++;
            if (attritube.alt) {
              count--;
            }
          }
        }
      },
      { decodeEntities: true }
    );
    parser.write(this.raw);
    parser.end();

    return `There are ${count} <img> without alt attritube`;
  }

  static linkShouldContainRelAttr() {
    let count = 0;
    let parser = new htmlparser.Parser(
      {
        onopentag: function(name, attritube) {
          if (name === 'a') {
            count++;
            if (attritube.rel) {
              count--;
            }
          }
        }
      },
      { decodeEntities: true }
    );
    parser.write(this.raw);
    parser.end();
    return `There are ${count} <a> without rel attritube`;
  }

  static headShouldContainMetaAndTitle() {
    let inHeader = false,
      hasTitle = false,
      result = '';
    let meta = [
      { name: 'description', exist: false },
      { name: 'keywords', exist: false }
    ];
    let parser = new htmlparser.Parser(
      {
        onopentag: function(name, attritube) {
          if (name === 'head') {
            inHeader = true;
          }
          if (inHeader) {
            if (name === 'title') {
              hasTitle = true;
            }
            for (let i = 0, max = meta.length; i < max; i++) {
              if (name === 'meta' && attritube.name === meta[i].name) {
                meta[i].exist = true;
              }
            }
          }
        },
        onclosetag: function(tagname) {
          if (tagname === 'head') {
            inHeader = false;
          }
        }
      },
      { decodeEntities: true }
    );
    parser.write(this.raw);
    parser.end();

    if (hasTitle === false) {
      result += 'This HTML without <title> tag';
    }
    for (let i = 0, max = meta.length; i < max; i++) {
      if (meta[i].exist === false) {
        if (result !== '') {
          result += '\r\n';
        }
        result += `This HTML without <meta name="${meta[i].name}"> tag`;
      }
    }
    return result;
  }

  static bodySholdNotContainTooMoreStrong() {
    let count = 0,
      result = '';
    let parser = new htmlparser.Parser(
      {
        onopentag: function(name, attritube) {
          if (name === 'strong') {
            count++;
          }
        }
      },
      { decodeEntities: true }
    );
    parser.write(this.raw);
    parser.end();

    if (count > this.maxStrongTags) {
      result += `This HTML have more than ${this.maxStrongTags} <strong> tag`;
    }

    return result;
  }

  static bodySholdNotContainMoreThanOneH1() {
    let count = 0,
      result = '';
    let parser = new htmlparser.Parser(
      {
        onopentag: function(name, attritube) {
          if (name === 'h1') {
            count++;
          }
        }
      },
      { decodeEntities: true }
    );
    parser.write(this.raw);
    parser.end();

    if (count > 1) {
      result += `This HTML have more than one <h1> tag`;
    }
    return result;
  }
}

module.exports = SEOChecker;
