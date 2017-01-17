const util = require("util");
const fs = require('fs');
const moment = require('moment');
const now = moment();

//override console.log function to log to /debug.log and console
var log_file = fs.createWriteStream('app/log/console_log.txt', {flags: 'w'});
var log_stdout = process.stdout;
console.log = function(d) { //
    log_file.write(now.format("YYYY-MM-DD HH:mm:ss") + " " + util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
};
