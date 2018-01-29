/*
 * Input: HTML File
 * Output: Writeable stream
 */

const SEOChecker = require('./index');
const fs = require('fs');

var writeStream = fs.createWriteStream('./result.txt');
const checker = new SEOChecker({
  // can be html file or readable stream
  input: './index.html',
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
