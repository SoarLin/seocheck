const SEOChecker = require('./index');
const Readable = require('stream').Readable;
const fs = require('fs');

var readStream = new Readable();
const checker = new SEOChecker({
  // can be html file or readable stream
  input: readStream,
  // can be a file, write string, console
  output: 'console',
  maxStrongTags: 15,
  rules: [
    SEOChecker.imgShouldContainAltAttr,
    SEOChecker.linkShouldContainRelAttr,
    SEOChecker.bodySholdNotContainMoreThanOneH1,
    SEOChecker.headShouldContainMetaAndTitle,
    SEOChecker.bodySholdNotContainTooMoreStrong
  ]
});
readStream.push(`
  <!DOCTPYE html>
    <html lang="en">
    <head>
      <meta charset="UFT-8">
      <title>Web Site Title</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="keywords" content="key,word,hello,test">
    </head>
    <body>
      <h1>hello world</h1>
      <img src="http://www.myfunnow.com/images/logo/logo.svg">
      <img src="http://www.myfunnow.com/images/logo/logo.svg" alt="logo">
      <img src="http:
`);
readStream.push(`
    //www.myfunnow.com/images/logo/logo.svg" />
    <img src="http://www.myfunnow.com/images/logo/logo.svg" style="width:300px">
    <img src="http://www.myfunnow.com/images/logo/logo.svg" class="logo">
    <a href="https://www.google.com.tw">google</a>
    <a href="https://tw.yahoo.com" rel="Yahoo!">yahoo</a>
    <strong>A1</strong><strong>A2</strong>
    <strong>A3</strong><strong>A4</strong>
    <strong>A5</strong><strong>A6</strong>
    <strong>A7</strong><strong>A8</strong>
    <strong>A9</strong><strong>A10</strong>
    <strong>A11</strong><strong>A12</strong>
    <strong>A13</strong><strong>A14</strong>
    <strong>A15</strong><strong>A16</strong>
    <strong>A17</strong><strong>A18</strong>
    <strong>A19</strong><strong>A20</strong>
    <audio controls>
      <source src="horse.ogg" type="audio/ogg">
      <source src="horse.mp3" type="audio/mpeg">
      Your browser does not support the audio tag.
    </audio>
    <h1>An apple a day,.....</h1>
  </body>
  </html>
`);

readStream.push(null);
