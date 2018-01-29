/*
 * Input: Readable stream
 * Output: Writeable stream
 */

const SEOChecker = require('../lib/index');
const fs = require('fs');

var readStream = fs.createReadStream(__dirname + '/index.html');
var writeStream = fs.createWriteStream(__dirname + '/result.txt');
const checker = new SEOChecker({
  // can be html file or readable stream
  input: readStream,
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

readStream.pipe(checker.writer);
