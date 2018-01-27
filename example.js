var SEOCheckRules = require('./index');

var seo_check = new SEOCheckRules('/Users/soar/Sites/seocheck/index.html');

// set <strong> max count
seo_check.setStrongTagMaxCount(17);

var checkAudioCount = function () {
  let regex = /<\s*audio[^>]*>[\s\S]*<\s*\/\s*audio>/gi;
  let count = 0;
  let found = this.raw.match(regex);
  if (found !== null) {
    count = found.length;
  }

  return `This HTML have ${count} <audio> tag\r\n`;
}
// add user define check rule
seo_check.addCheckRule(checkAudioCount);

var result = seo_check.check([5,4,3,2,1]);

console.log(result);