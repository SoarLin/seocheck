# SEO Rules Checker

---

## Usage

```
var checker = new SEOChecker({
  // html file, readable stream
  input: 'path/to/htmlfile',
  // can be a file, console, writeable stream
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

* **input**
  * path to your html file
  * readable stream, don't need to call `check()` function, each `pipe()` will auto check again
* **output**
  * console : output check result on console
  * filepath : write check result to file
  * writeable stream: output check result to writeable stream
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

## Test

````
npm install -g mocha

mocha test/test.js
````

## Other test Samples

### input html file, output console

```
node test/test.inHTML.outConsole.js
```

### input html file, output file

```
node test/test.inHTML.outFile.js
```

### input html file, output write stream

```
node test/test.inHTML.outWriteStream.js
```

### input read stream(use `pipe()`), output console

```
node test/test.inReadStream.pipe.outConsole.js
```

### input read stream(use `pipe()`), output File

```
node test/test.inReadStream.pipe.outFile.js
```

### input read stream(use `pipe()`), output write stream

```
node test/test.inReadStream.pipe.outWriteStream.js
```
