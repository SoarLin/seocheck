# SEO Rules Checker

---

## 測試

```
node example.js
```

## Usage

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
    SEOChecker.headShouldContainMetaAndTitle,
    SEOChecker.bodySholdNotContainTooMoreStrong,
    SEOChecker.bodySholdNotContainMoreThanOneH1,
    // user define check rule
    function() {
      // use "this.raw" as input data to check
    }
  ]
});

checker.check();
```

## Config options

* **input**
  * path to your html file
* **output**
  * console : output check result on console
  * filepath : write check result to file
* **maxStrongTags**
  * defind max `<strong>` count (defult:15)
* **rules**
  * choose check rules which used
  * can define custom check rule (input file loaded to `this.raw` parameter)

## Check rules

### imgShouldContainAltAttr

* Detect if any `<img />` tag without alt attribute

### linkShouldContainRelAttr

* Detect if any `<a />` tag without rel attribute

### headShouldContainMetaAndTitle

* In `<head>` tag
  * Detect if header doesn’t have `<title>` tag
  * Detect if header doesn’t have `<meta name=“descriptions” ... />` tag
  * Detect if header doesn’t have `<meta name=“keywords” ... />` tag

### bodySholdNotContainTooMoreStrong

* Detect if there’re more than 15 `<strong>` tag in HTML (15 is defined by user)

### bodySholdNotContainMoreThanOneH1

* Detect if a HTML have more than one `<H1>` tag.

## TODO

* input can be readable stream
* output can be writeable stream
