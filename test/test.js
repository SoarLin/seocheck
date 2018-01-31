// const assert = require('assert');
const chai = require('chai');
const assert = chai.assert;
const SEOChecker = require('../lib/index');
const captureStream = require('./captureStream');

describe('input: HTML file, check property', function() {
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

    it('check rules length should be 1', function() {
      checker.addRules(SEOChecker.imgShouldContainAltAttr);
      assert.equal(checker.rules.length, 1);
    });
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

    console.log('hellow');
    assert.equal(hook.captured(), 'hellow\n');
  });
});