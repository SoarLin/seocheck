// const assert = require('assert');
const chai = require('chai');
const assert = chai.assert;
const stream = require('stream');
const SEOChecker = require('../lib/index');
// const captureStream = require('./captureStream');

describe('SEOChecker basic test', function() {
  var checker;
  beforeEach(function() {
    checker = new SEOChecker({
      input: __dirname + '/index.html',
      output: 'console',
      maxStrongTags: 17,
      rules: [SEOChecker.imgShouldContainAltAttr]
    });
  });

  afterEach(function() {
    checker = null;
  });

  describe('property check', function() {
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
  });

  describe('some function test', function() {
    it('check rules length should be 1', function() {
      assert.equal(checker.rules.length, 1);
    });

    it('after add 1 check rule, rules length should be 2', function() {
      let length = checker.addRules(SEOChecker.linkShouldContainRelAttr);
      assert.equal(length, 2);
    });

    it('get write stream', function() {
      assert.instanceOf(checker.writer, stream.Writable);
    });

    it('create write stream', function() {
      let ws = checker.createTempWriteStream();
      assert.instanceOf(ws, stream.Writable);
    });

    it('output path is absolute', function() {
      let path = '/var/log/temp';
      let outputPath = checker.outputFilePath(path);
      assert.equal(outputPath.indexOf(path), 0);
    });

    it('output path is relative', function() {
      let path = './temp';
      let outputPath = checker.outputFilePath(path);
      assert.notEqual(outputPath.indexOf(path), 0);
    });

    it('clear does not exist temp file', function() {
      checker.clearOldOutputFile('temp').then(
        function(result) {
          assert.isUndefined(result);
        },
        function(err){
          assert.ifError(err);
        }
      ).catch((err) => {
        assert.ifError(err);
      });
    });

  });

  describe('check HTML parser function', function() {
    let imgHTML = '<img src="http://www.myfunnow.com/images/logo/logo.svg" alt="logo">';
    let fiveStrong = '<strong>A1</strong><strong>A2</strong><strong>A3</strong><strong>A4</strong><strong>A5</strong>';
    let headHTML = `
    <head>
      <meta charset="UFT-8">
      <title>Web Site Title</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="keywords" content="key,word,hello,test">
      <meta name="descriptions" content="">
    </head>
    `;

    it('it should be one image tag', function() {
      let result = checker.countTagAndAttr(imgHTML, 'img', 'alt');
      assert.equal(result.tag, 1, 'is not image tag');
    });

    it('it should be one image tag with one alt attribute', function() {
      let result = checker.countTagAndAttr(imgHTML, 'img', 'alt');
      assert.equal(result.attr, 1, 'image without alt attribute ');
    });

    it('it should be 5 <strong> tag', function() {
      let result = checker.countTagAndAttr(fiveStrong, 'strong');
      assert.equal(result.tag, 5, 'is not equal 5 <strong> tag');
    });

    it('head should has a <title> tag', function() {
      let result = checker.checkTagInHead(headHTML, 'title');
      assert.equal(result, true, 'without <title> tag');
    });

    it('head should has a <meta name="descriptions"> tag', function() {
      let result = checker.checkTagInHead(headHTML, 'meta', 'descriptions');
      assert.equal(result, true, 'without <meta name="descriptions"> tag');
    });

    it('head should has a <meta name="keywords"> tag', function() {
      let result = checker.checkTagInHead(headHTML, 'meta', 'keywords');
      assert.equal(result, true, 'without <meta name="keywords"> tag');
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