const CFG = require("./cfg.js").open()
const FS = require("fs");

var logFile = null;
if (CFG["log"].hasOwnProperty("file"))
{
    logFile = FS.createWriteStream(CFG["log"]["file"]);
}
messages = [];
function createLogger(level, prefix, output = console.log, always = false)
{
    if (!always &&
        (!CFG.hasOwnProperty("log")
        || !CFG["log"].hasOwnProperty("levels")
        || !CFG["log"]["levels"].hasOwnProperty(level)
        ||  CFG["log"]["levels"][level] !== true))
    {
        return (message) => { /* do nothing */ };
    }
    return (message) => {
        const FMT_MSG = `${prefix} ${message}`;
        messages.push(FMT_MSG);
        output(FMT_MSG);
        if (logFile)
        {
            logFile.write(`${FMT_MSG}\n`);
        }
    };
}
module.exports = {
    getLogFile: () => logFile,
    getMessages: () => messages,
    critical: createLogger("critical", "[CRI]", console.error, true),
    error:    createLogger("errors",   "[ERR]", console.error),
    warning:  createLogger("warnings", "[WAR]", console.warn),
    debug:    createLogger("debug",    "[DBG]", console.log),
    info:     createLogger("info",     "[INF]", console.log),
}
