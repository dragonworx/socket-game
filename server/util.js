const chalk = require('chalk');

module.exports = {
   fatalExit(message, errorCode = -1) {
      console.log(chalk.redBright(message));
      process.exit(errorCode);
   },
   info(message) {
      console.log(chalk.cyan(message));
   },
   log(message) {
      console.log(chalk.white(message));
   },
   error(message) {
      console.log(chalk.red(message));
   }
};