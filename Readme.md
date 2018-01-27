# 執行

```
node example.js
```

# Usage

```
var checker = new SEOChecker({
  // html file
  input: '/Users/soar/Sites/seocheck/index.html',
  // can be a file, console
  output: 'console',
  maxStrongTags: 15,
  rules: [
    SEOChecker.imgShouldContainAltAttr,
    SEOChecker.linkShouldContainRelAttr,
    SEOChecker.bodySholdNotContainMoreThanOneH1,
    SEOChecker.headShouldContainMetaAndTitle,
    SEOChecker.bodySholdNotContainTooMoreStrong,
    function() // user define check rule
  ]
});

checker.check();
```

# TODO

* input can be readable stream
* output can be writeable stream
