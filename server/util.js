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
  ws(message) {
    console.log(chalk.blue(message));
  },
  warn(message) {
    console.log(chalk.yellow(message));
  },
  error(message) {
    console.log(chalk.red(message));
  },
};
