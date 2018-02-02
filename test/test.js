// const assert = require('assert');
const chai = require('chai');
const assert = chai.assert;
const fs = require('fs');
const stream = require('stream');
const SEOChecker = require('../lib/index');
const helpers = require('./helpers');
const MemoryStream = require('memorystream');


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

describe('[Test] input: HTML file, output: console', function() {
  var checker;
  beforeEach(function() {
    checker = new SEOChecker({
      input: __dirname + '/index.html',
      output: 'console',
      maxStrongTags: 17,
      rules: []
    });

    helpers.captureOutput();
  });

  afterEach(function() {
    checker = null;
    helpers.restoreOutput();
  });

  it('check rule: image should contain alt attribute', function(done) {
    checker.addRules(SEOChecker.imgShouldContainAltAttr);
    checker.check().then(()=>{
      var output = helpers.getOutput();
      assert.equal(output, 'There are 2 <img> without alt attritube\r\n');
      helpers.restoreOutput();
      done();
    }).catch((err)=>{
      assert.ifError(err);
    });
  });

  it('check rule: link should contain rel attribute', function(done) {
    checker.addRules(SEOChecker.linkShouldContainRelAttr);
    checker.check().then(()=>{
      var output = helpers.getOutput();
      assert.equal(output, 'There are 1 <a> without rel attritube\r\n');
      helpers.restoreOutput();
      done();
    }).catch((err)=>{
      assert.ifError(err);
    });
  });

  it('check rule: head should contain meta and title', function(done) {
    checker.addRules(SEOChecker.headShouldContainMetaAndTitle);
    checker.check().then(()=>{
      var output = helpers.getOutput();
      assert.equal(output, 'This HTML without <meta name="descriptions"> tag\r\n');
      helpers.restoreOutput();
      done();
    }).catch((err)=>{
      assert.ifError(err);
    });
  });

  it('check rule: body shold not contain too more strong', function(done) {
    checker.addRules(SEOChecker.bodySholdNotContainTooMoreStrong);
    checker.check().then(()=>{
      var output = helpers.getOutput();
      assert.equal(output, 'This HTML have more than 17 <strong> tag\r\n');
      helpers.restoreOutput();
      done();
    }).catch((err)=>{
      assert.ifError(err);
    });
  });

  it('check rule: body shold not contain more than one H1', function(done) {
    checker.addRules(SEOChecker.bodySholdNotContainMoreThanOneH1);
    checker.check().then(()=>{
      var output = helpers.getOutput();
      assert.equal(output, 'This HTML have more than one <h1> tag\r\n');
      helpers.restoreOutput();
      done();
    }).catch((err)=>{
      assert.ifError(err);
    });
  });
});

describe('[Test] input: read stream, output: write stream', function() {
  var checker, readStream, memStream;
  beforeEach(function() {
    readStream = fs.createReadStream(__dirname + '/index.html');
    memStream = MemoryStream.createWriteStream();

    checker = new SEOChecker({
      input: readStream,
      output: memStream,
      rules: []
    });
  });

  afterEach(function() {
    checker = null;
  });

  it('check rule: image should contain alt attribute', function(done) {
    checker.addRules(SEOChecker.imgShouldContainAltAttr);
    readStream
      .pipe(checker.writer)
      .on('finish', function() {
        var output = memStream.toString();
        assert.equal(output, 'There are 2 <img> without alt attritube\r\n');
        done();
      });
  });

  it('check rule: link should contain rel attribute', function(done) {
    checker.addRules(SEOChecker.linkShouldContainRelAttr);
    readStream
      .pipe(checker.writer)
      .on('finish', function() {
        var output = memStream.toString();
        assert.equal(output, 'There are 1 <a> without rel attritube\r\n');
        done();
      });
  });

  it('check rule: head should contain meta and title', function(done) {
    checker.addRules(SEOChecker.headShouldContainMetaAndTitle);
    readStream
      .pipe(checker.writer)
      .on('finish', function() {
        var output = memStream.toString();
        assert.equal(output, 'This HTML without <meta name="descriptions"> tag\r\n');
        done();
      });
  });

  it('check rule: body shold not contain too more strong', function(done) {
    checker.addRules(SEOChecker.bodySholdNotContainTooMoreStrong);
    readStream
      .pipe(checker.writer)
      .on('finish', function() {
        var output = memStream.toString();
        assert.equal(output, 'This HTML have more than 15 <strong> tag\r\n');
        done();
      });
  });

  it('check rule: body shold not contain more than one H1', function(done) {
    checker.addRules(SEOChecker.bodySholdNotContainMoreThanOneH1);
    readStream
      .pipe(checker.writer)
      .on('finish', function() {
        var output = memStream.toString();
        assert.equal(output, 'This HTML have more than one <h1> tag\r\n');
        done();
      });
  });

});