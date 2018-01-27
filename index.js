'use strict';

const fs = require('fs');
const htmlparser = require('htmlparser2');

class SEOChecker {
  constructor(options) {
    this.input = options.input;
    this.output = options.output || 'console';
    this.maxStrongTags = options.maxStrongTags || 15;
    this.rules = options.rules || [];

    this.outputType = this.detectOutputType();
    this.outputFile = undefined;
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
          // no such file
          console.log(err);
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
        console.log('TODO: other output method');
        break;
      default:
        break;
    }
  }

  doCheck(raw) {
    let result = '';
    for (let i = 0, max = this.rules.length; i < max; i++) {
      result = this.rules[i].bind(this)(raw);
      this.printOutput(result);
    }

    if (this.outputFile !== undefined) {
      this.outputFile.end();
    }
  }

  check() {
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
  }

  static imgShouldContainAltAttr(raw) {
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
    parser.write(raw);
    parser.end();

    return `There are ${count} <img> without alt attritube`;
  }

  static linkShouldContainRelAttr(raw) {
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
    parser.write(raw);
    parser.end();
    return `There are ${count} <a> without rel attritube`;
  }

  static headShouldContainMetaAndTitle(raw) {
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
    parser.write(raw);
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

  static bodySholdNotContainTooMoreStrong(raw) {
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
    parser.write(raw);
    parser.end();

    if (count > this.maxStrongTags) {
      result += `This HTML have more than ${this.maxStrongTags} <strong> tag`;
    }

    return result;
  }

  static bodySholdNotContainMoreThanOneH1(raw) {
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
    parser.write(raw);
    parser.end();

    if (count > 1) {
      result += `This HTML have more than one <h1> tag`;
    }
    return result;
  }
}

module.exports = SEOChecker;
