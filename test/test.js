// const assert = require('assert');
const chai = require('chai');
const assert = chai.assert;
const SEOChecker = require('../lib/index');
const captureStream = require('./captureStream');

describe('input: HTML file', function() {
  var checker;
  beforeEach(function() {
    checker = new SEOChecker({
      input: __dirname + '/index.html',
      output: 'console',
      maxStrongTags: 17,
      rules: []
    });
  });

  afterEach(function() {
    checker = null;
  });

  describe('SEOChecker property', function() {
    it('inputType should be "htmlfile"', function() {
      assert(checker.detectInputType(), 'htmlfile');
    });

    it('outputType should be "console"', function() {
      assert(checker.detectOutputType(), 'console');
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

    it('check rules length should be 1', function() {
      checker.addRules(SEOChecker.imgShouldContainAltAttr);
      assert.equal(checker.rules.length, 1);
    });
  });

  describe('check HTML parser function', function() {
    let imgHTML = '<img src="http://www.myfunnow.com/images/logo/logo.svg" alt="logo">';
    let fiveStrong = '<strong>A1</strong><strong>A2</strong><strong>A3</strong><strong>A4</strong><strong>A5</strong>';

    it('it should be one image tag', function() {
      let result = checker.countTagAndAttr(imgHTML, 'img', 'alt');
      assert.equal(result.tag, 1, 'is not image tag');
    });

    it('it should be one image tag with one alt attribute', function() {
      let result = checker.countTagAndAttr(imgHTML, 'img', 'alt');
      assert.equal(result.attr, 1, 'is not image tag');
    });

    it('it should be 5 <strong> tag', function() {
      let result = checker.countTagAndAttr(fiveStrong, 'strong');
      assert.equal(result.tag, 5, 'is not image tag');
    });
  });
});

/*
describe('input/output exception test', function() {
  it('input type is unacceptable', function() {
    assert.throws(new SEOChecker, Error, 'Unacceptable input type');
  });
});

describe('input: HTML file, output: console', function() {
  var checker, hook;
  beforeEach(function() {
    checker = new SEOChecker({
      input: __dirname + '/index.html',
      output: 'console',
      maxStrongTags: 17,
      rules: [SEOChecker.imgShouldContainAltAttr]
    });

    hook = new captureStream(process.stdout);
  });

  afterEach(function() {
    hook.unhook();
    checker = null;
  });

  it('image should contain alt attribute', function() {
    // return new Promise((resolve) => {
    //   resolve(checker.check());
    // }).then(()=>{
    //   assert.equal(hook.captured(), 'There are 4 <img> without alt attritube');
    // });

    // assert.equal(hook.captured(), 'There are 4 <img> without alt attritube');
    // assert.match(hook.captured(), '/without alt attritube/');
    process.stdout.write('hellow');
    assert.equal(hook.captured(), 'hellow');
  });
});
*/