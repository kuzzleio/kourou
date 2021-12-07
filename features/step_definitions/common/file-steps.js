const
  {
    Then
  } = require('cucumber'),
  fs = require('fs'),
  should = require('should');
Then('I get the file in {string} containing', function (path, contents) {
  const fileContents = fs.readFileSync(path)
  should.equal(fileContents.toString(), contents)
});
