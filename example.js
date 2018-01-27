var SEOChecker = require('./index');

var checker = new SEOChecker({
  // can be html file or readable stream
  input: '/Users/soar/Sites/seocheck/index.html',
  // can be a file, write string, console
  output: './result.txt',
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
