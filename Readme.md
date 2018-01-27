# 執行

```
node example.js
```

# Usage

```
var checker = new SEOChecker({
  // html file
  input: 'path/to/htmlfile',
  // can be a file, console
  output: 'console',
  maxStrongTags: 15,
  rules: [
    SEOChecker.imgShouldContainAltAttr,
    SEOChecker.linkShouldContainRelAttr,
    SEOChecker.bodySholdNotContainMoreThanOneH1,
    SEOChecker.headShouldContainMetaAndTitle,
    SEOChecker.bodySholdNotContainTooMoreStrong,
    // user define check rule
    function() {
      // use "this.raw" as input data to check
    }
  ]
});

checker.check();
```

# TODO

* input can be readable stream
* output can be writeable stream
