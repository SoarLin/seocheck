# SEO Rules Checker
----

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

checker.check();  // optional
```

## Config options
* __input__
  * path to your html file
  * readable stream, don't need to call `check()` function, each `pipe()` will auto check again
* __output__
  * console : output check result on console
  * filepath : write check result to file
  * writeable stream: output check result to writeable stream
* __maxStrongTags__
  * defind max `<strong>` count (defult:15)
* __rules__
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


## 測試

### input html file, output console

````
node test.inHTML.outConsole.js
````

### input html file, output file

````
node test.inHTML.outFile.js
````

### input html file, output write stream

````
node test.inHTML.outWriteStream.js
````

### input read stream(use `pipe()`), output console

````
node test.inReadStream.pipe.outConsole.js
````

### input read stream(use `pipe()`), output File

````
node test.inReadStream.pipe.outFile.js
````

### input read stream(use `pipe()`), output write stream

````
node test.inReadStream.pipe.outWriteStream.js
````
