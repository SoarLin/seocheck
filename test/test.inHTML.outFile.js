/*
 * Input: HTML File
 * Output: File
 */

const SEOChecker = require('../lib/index');

// var writeStream = fs.createWriteStream('./result.txt');
const checker = new SEOChecker({
  // can be html file or readable stream
  input: __dirname + '/index.html',
  // can be a file, write string, console
  output: __dirname + '/result.txt',
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
