/*
 * Input: Readable stream
 * Output: File
 */

const SEOChecker = require('../lib/index');
const fs = require('fs');

var readStream = fs.createReadStream(__dirname + '/index.html');
const checker = new SEOChecker({
  // can be html file or readable stream
  input: readStream,
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

readStream.pipe(checker.writer);
