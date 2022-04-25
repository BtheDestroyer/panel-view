const HTTP = require("http");
const PG = require("./pagegen.js")
const CFG = require("./cfg.js").open()
const LOG = require("./log.js")

function fail(reason)
{
    LOG.critical(reason);
    exit(1);
}

function doAction(action)
{
    var performedAction = false;
    if (action.hasOwnProperty("command"))
    {
        performedAction = true;
        exec(action["command"],
            {cwd: action.hasOwnProperty("cwd") ? action["cwd"] : "."},
            (error, stdout, stderr) =>
            {
                LOG.info(`Command outputs from [${action["command"]}]`);
                if (stdout)
                {
                    LOG.info(`stdout: ${stdout}`);
                }
                if (stderr)
                {
                    LOG.error(`stderr: ${stderr}`);
                }
                if (error)
                {
                    LOG.error(`error: ${error}`);
                }
            });
    }
    
    return performedAction;
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// Main program start //
////////////////////////

// Config requirement validation
if (!CFG.hasOwnProperty("http") || !CFG["http"])
{
    fail(`'${CFG_PATH}' does not have a data for 'http'!`);
}
if (!CFG["http"].hasOwnProperty("port") || !CFG["http"]["port"])
{
    fail(`'${CFG_PATH}' does not have a value for 'http.port'!`);
}
if (typeof(CFG["http"]["port"]) !== 'number')
{
    fail(`The value of 'http.port' in '${CFG_PATH}' is not a number (eg: 8081)`);
}

const PORT = CFG["http"]["port"];
LOG.info(`Starting tiny-webhook on port ${PORT}`);
HTTP.createServer((req, res) => {
    try
    {
        LOG.info();
        if (req.method === "GET")
        {
            LOG.debug(`HTTP GET request recieved.`)
            if (req.url === "/")
            {
                res.writeHead(200, {'Content-Type':'text/html'});
                res.write(PG()
                    .h1(`Panel View`)
                    .p("TBA")
                    .finalize()
                    );
                res.end();
                return;
            }
            if (req.url.endsWith("/"))
            {
                while (req.url.endsWith("/"))
                {
                    req.url = req.url.substring(0, req.url.length - 1);
                }
                res.writeHead(302, {'Location':req.url});
                res.end();
                return;
            }
            else if (req.url === "/log")
            {
                res.writeHead(200, {'Content-Type':'text/html'});
                const LOG_LENGTH = 20;
                const START = messages.length > 20
                            ? messages.length - LOG_LENGTH
                            : 0;
                var list = PG();
                messages.slice(START).reverse().forEach(
                    msg => list.li(msg)
                    );
                res.write(PG()
                    .h1('panel-view log')
                    .ul(list.finalize())
                    .finalize()
                    );
                res.end();
                return;
            }
            res.writeHead(404, {'Content-Type':'text/html'});
            res.write(PG()
                .h1(`Page not found: ${req.url}`)
                .a("Return home", { href: "/" })
                .finalize()
                );
            res.end();
            return;
        }
        LOG.warning(`Unsupported HTTP method (${req.method}) request recieved`)
        res.writeHead(405, {"Content-Type":"text/html"});
        res.write(PG()
            .h1(`Invalid HTTP method: ${req.method}`)
            .finalize()
            );
        res.end();
        return;
    }
    catch (e)
    {
        LOG.error(`Unhandled exception thrown: ${e.stack}`);
        res.writeHead(500, {"Content-Type":"text/plain"});
        res.write(`${e}`);
        res.end();
        return;
    }
}).on("uncaughtException", (err) => {
    LOG.error(`Uncaught exception thrown: ${err}`);
}).listen(PORT);
