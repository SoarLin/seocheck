var output = '';
var write = process.stdout.write;

module.exports = {
  captureOutput: function() {
    output = '';
    process.stdout.write = function(string) {
      if (!string) return;
      output += string;
    };
  },

  getOutput: function() {
    return output;
  },

  restoreOutput: function() {
    process.stdout.write = write;
  }
};