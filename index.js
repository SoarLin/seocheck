'use strict';

const fs = require('fs');
// const http = require('http');
// const https = require('https');
// const htmlparser = require('htmlparser2');

function SEOCheckRules(_filepath) {
  this.path = _filepath;
  this.raw  = undefined;
  this.MAX_STRONG = 10;

  var getHeadContent = function (data) {
    let regex = /<\s*head[^>]*>([\s\S]*)<\s*\/\s*head>/gi;
    var m = regex.exec(data);
    if (m !== null && m.length >= 1) {
      return m[1];
    }
    return '';
  };
  var getTagCount = function (data, tag_name) {
    let regex = new RegExp(`<\s*${tag_name}[^>]*>.*?<\s*\/\s*${tag_name}>`, 'gi');
    let found = data.match(regex);
    if (found === null) {
      return 0;
    }
    return found.length;
  };
  var checkMetaName = function (data, name) {
    let regex = new RegExp(`<\s*meta.*?name=("|\')${name}("|\')[^>]*>`, 'gi');
    let found = data.match(regex);
    if (found === null) {
      return false;
    } else {
      return true;
    }
  };

  // rule 1
  var checkImageNoAlt = function () {
    let regex = /<\s*img[^>]+?(?:alt="([^"]*)"[^>]*)?>/gi;
    let count = 0;
    let m;
    while((m = regex.exec(this.raw)) !== null) {
      if (m.index === regex.lastIndex) {
          regex.lastIndex++;
      }
      m.forEach((match, gIndex) => {
        if (gIndex === 1 && match === undefined) {
          count++;
        }
      });
    }
    return `There are ${count} <img> without alt attritube\r\n`;
  };
  // rule 2
  var checkLinkNoRel = function () {
    let regex = /<\s*a[^>]+?(?:rel="([^"]*)"[^>]*)?>/gi;
    let count = 0;
    let m;
    while((m = regex.exec(this.raw)) !== null) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      m.forEach((match, gIndex) => {
        if (gIndex === 1 && match === undefined) {
          count++;
        }
      });
    }
    return `There are ${count} <a> without rel attritube\r\n`;
  };
  // rule 3
  var checkHeadTag = function () {
    let result = '';
    let head_content = getHeadContent(this.raw);

    // check title tag
    if (getTagCount(head_content, 'title') === 0) {
      result += 'This HTML without <title> tag\r\n';
    }

    // check meta description
    if (checkMetaName(head_content, 'description') === false) {
      result += 'This HTML without <meta name="description"> tag\r\n';
    }

    // check meta keywords
    if (checkMetaName(head_content, 'keywords') === false) {
      result += 'This HTML without <meta name="keywords"> tag\r\n';
    }
    return result;
  };
  // rule 4
  var checkStrongCount = function () {
    let result = '';

    if (getTagCount(this.raw, 'strong') > this.MAX_STRONG) {
      result += `This HTML have more than ${this.MAX_STRONG} <strong> tag\r\n`;
    }

    return result;
  }
  // rule 5
  var checkH1Tag = function () {
    let result = '';

    if (getTagCount(this.raw, 'h1') > 1) {
      result += `This HTML have more than one <h1> tag\r\n`;
    }

    return result;
  }

  this.checkRules = [
    checkImageNoAlt,
    checkLinkNoRel,
    checkHeadTag,
    checkStrongCount,
    checkH1Tag
  ];
}

SEOCheckRules.prototype.getRawData = function () {
  this.raw = fs.readFileSync(this.path, 'utf8');
};

SEOCheckRules.prototype.setStrongTagMaxCount = function (count) {
  this.MAX_STRONG = count;
}

SEOCheckRules.prototype.addCheckRule = function (new_rule) {
  if (typeof new_rule === 'function') {
    this.checkRules.push(new_rule);
  }
}

SEOCheckRules.prototype.check = function (rules = []) {
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