const util = require("util");
const fs = require('fs');
const moment = require('moment');
const now = moment();

//override console.log function

const log_stdout = process.stdout;

console.log = function(d) {

    //in production, also log to DB

    log_stdout.write(now.format("YYYY-MM-DD HH:mm:ss") + " " + util.format(d) + '\n');
};
