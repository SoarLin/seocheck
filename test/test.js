// const assert = require('assert');
const chai = require('chai');
const assert = chai.assert;
const SEOChecker = require('../lib/index');

describe('input: HTML file, output: console', function() {
  var checker;
  beforeEach(function() {
    checker = new SEOChecker({
      input: __dirname + '/index.html',
      output: 'console',
      maxStrongTags: 17,
      rules: [
        SEOChecker.imgShouldContainAltAttr,
        SEOChecker.linkShouldContainRelAttr,
        SEOChecker.bodySholdNotContainMoreThanOneH1,
        SEOChecker.headShouldContainMetaAndTitle,
        SEOChecker.bodySholdNotContainTooMoreStrong
      ]
    });
  });

  describe('SEOChecker property', function() {
    it('inputType should be "htmlfile"', function() {
      assert(checker.inputType, 'htmlfile');
    });

    it('outputType should be "console"', function() {
      assert(checker.outputType, 'console');
    });

    it('outputFile should be undefined', function() {
      assert.isUndefined(checker.outputFile);
    });

    it('writeStream should be undefined', function() {
      assert.isUndefined(checker.writeStream);
    });

    it('maxStrongTags should be 17', function() {
      assert.equal(checker.maxStrongTags, 17);
    });
  });
});
