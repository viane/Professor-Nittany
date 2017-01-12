var util = require("util");
var fs = require('fs');

//override console.log function to log to /debug.log and console
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags: 'w'});
var log_stdout = process.stdout;
console.log = function(d) { //
    log_file.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
};
