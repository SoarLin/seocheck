/*
 * Input: HTML File
 * Output: Writeable stream
 */

const SEOChecker = require('../lib/index');
const fs = require('fs');

var writeStream = fs.createWriteStream(__dirname + '/result.txt');
const checker = new SEOChecker({
  // can be html file or readable stream
  input: __dirname + '/index.html',
  // can be a file, write string, console
  output: writeStream,
  maxStrongTags: 15,
  rules: [
    SEOChecker.imgShouldContainAltAttr,
    SEOChecker.linkShouldContainRelAttr,
    SEOChecker.bodySholdNotContainMoreThanOneH1,
    SEOChecker.headShouldContainMetaAndTitle,
    SEOChecker.bodySholdNotContainTooMoreStrong
  ]
});

checker.check();
