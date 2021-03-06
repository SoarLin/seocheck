/*
 * Input: HTML File
 * Output: Console
 */

const SEOChecker = require('../lib/index');
const htmlparser = require('htmlparser2');

const checker = new SEOChecker({
  // can be html file or readable stream
  input: __dirname + '/index.html',
  // can be a file, write string, console
  output: 'console',
  maxStrongTags: 15,
  rules: [
    SEOChecker.imgShouldContainAltAttr,
    SEOChecker.linkShouldContainRelAttr,
    SEOChecker.bodySholdNotContainMoreThanOneH1,
    SEOChecker.headShouldContainMetaAndTitle,
    SEOChecker.bodySholdNotContainTooMoreStrong,
    function() {
      let count = 0;
      let parser = new htmlparser.Parser(
        {
          onopentagname: function(name) {
            if (name === 'audio') {
              count++;
            }
          }
        },
        { decodeEntities: true }
      );
      parser.write(this.raw);
      parser.end();

      return `This HTML have ${count} <audio> tag`;
    }
  ]
});
checker.check();
