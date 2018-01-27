const SEOChecker = require('./index');
const htmlparser = require('htmlparser2');

const checker = new SEOChecker({
  // can be html file or readable stream
  input: './index.html',
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
      let count = 0,
        result = '';
      let parser = new htmlparser.Parser(
        {
          onopentag: function(name, attritube) {
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
