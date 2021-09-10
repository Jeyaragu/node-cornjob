// const winstom = require('winston');
const {format, createLogger, transports, transport}  = require('winston');
const {timestamp,printf,combine}  = format;

const mylogformat = printf(({level,message, timestamp})=>{
  return `${timestamp} ${level} ${message}`;
});

/* Basic Logger format
const logger = winstom.createLogger({
  format.colorize(),
  format:winstom.format.simple(),
  transports: [new winstom.transports.Console()]
})
 */

const logger = createLogger({
  format: combine(
    mylogformat,
    format.splat(),
    format.simple()
    ),
    transports: [new transports.File({filename:'infologs.log'})],
})

const errorlogger = createLogger({
  level:'error',
  format: combine(
    mylogformat,
    format.splat(),
    format.simple()
    ),
    transports: [new transports.File({filename:'error.log'})],

})

module.exports = {
  'logger': logger,
  'errorlooger': errorlogger
};