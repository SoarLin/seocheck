'use strict';

const fs = require('fs');
// const http = require('http');
// const https = require('https');
const htmlparser = require('htmlparser2');

function SEOCheckRules(_filepath) {
  this.path = _filepath;
  this.raw  = undefined;
  this.MAX_STRONG = 10;

  // rule 1
  var checkImageNoAlt = function() {
    let count = 0;
    let parser = new htmlparser.Parser({
      onopentag: function(name, attritube) {
        if (name === 'img') {
          count++;
          if (attritube.alt) {
            count--;
          }
        }
      }
    }, {decodeEntities: true});
    parser.write(this.raw);
    parser.end();
    return `There are ${count} <img> without alt attritube\r\n`;
  };
  // rule 2
  var checkLinkNoRel = function() {
    let count = 0;
    let parser = new htmlparser.Parser({
      onopentag: function(name, attritube) {
        if (name === 'a') {
          count++;
          if (attritube.rel) {
            count--;
          }
        }
      }
    }, {decodeEntities: true});
    parser.write(this.raw);
    parser.end();
    return `There are ${count} <a> without rel attritube\r\n`;
  };
  // rule 3
  var checkHeadTag = function() {
    let inHeader = false,
        hasTitle = false,
        result   = '';
    let meta = [
      { name: 'description', exist: false},
      { name: 'keywords', exist: false}
    ];
    let parser = new htmlparser.Parser({
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
      onclosetag: function(tagname){
        if(tagname === "head"){
          inHeader = false;
        }
      }
    }, {decodeEntities: true});
    parser.write(this.raw);
    parser.end();

    if (hasTitle === false) {
      result += 'This HTML without <title> tag\r\n';
    }
    for (let i = 0, max = meta.length; i < max; i++) {
      if (meta[i].exist === false) {
        result += `This HTML without <meta name="${meta[i].name}"> tag\r\n`;
      }
    }
    return result;
  };
  // rule 4
  var checkStrongCount = function() {
    let count  = 0,
        result = '';
    let parser = new htmlparser.Parser({
      onopentag: function(name, attritube) {
        if (name === 'strong') {
          count++;
        }
      }
    }, {decodeEntities: true});
    parser.write(this.raw);
    parser.end();

    if (count > this.MAX_STRONG) {
      result += `This HTML have more than ${this.MAX_STRONG} <strong> tag\r\n`;
    }

    return result;
  };
  // rule 5
  var checkH1Tag = function() {
    let count  = 0,
        result = '';
    let parser = new htmlparser.Parser({
      onopentag: function(name, attritube) {
        if (name === 'h1') {
          count++;
        }
      }
    }, {decodeEntities: true});
    parser.write(this.raw);
    parser.end();

    if (count > 1) {
      result += `This HTML have more than one <h1> tag\r\n`;
    }
    return result;
  };

  this.checkRules = [
    checkImageNoAlt,
    checkLinkNoRel,
    checkHeadTag,
    checkStrongCount,
    checkH1Tag
  ];
}

SEOCheckRules.prototype.getRawData = function() {
  this.raw = fs.readFileSync(this.path, 'utf8');
};

SEOCheckRules.prototype.setStrongTagMaxCount = function(count) {
  this.MAX_STRONG = count;
}

SEOCheckRules.prototype.addCheckRule = function(new_rule) {
  if (typeof new_rule === 'function') {
    this.checkRules.push(new_rule);
  }
}

SEOCheckRules.prototype.check = function(rules = []) {
  let result = '';

  if (rules.length === 0) {
    return 'No choose check rule.';
  }

  if (this.raw === undefined) {
    this.getRawData.bind(this)();
  }

  for (let i = 0, max = rules.length; i < max; i++) {
    // console.log('rule = '+rules[i]);
    let ruleNum = rules[i] - 1;
    if (ruleNum < this.checkRules.length) {
      // console.log(this.checkRules[ruleNum]);
      result += this.checkRules[ruleNum].bind(this)();
    }
  }

  return result;
};

module.exports = SEOCheckRules;