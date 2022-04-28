const HTTP = require("http");
const FS = require("fs");
const PATH = require("path");
const MIME = require("mime");
const PG = require("./pagegen.js");
const CFG = require("./cfg.js").open();
const LOG = require("./log.js");

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
LOG.info(`Starting panel-view on port ${PORT}`);
HTTP.createServer(async (req, res) => {
    try
    {
        let url = new URL(req.url, `http://${req.headers.host}/`);
        if (req.method === "GET")
        {
            LOG.debug(`HTTP GET request recieved: ${req.url}`)
            if (url.pathname === "/")
            {
                LOG.debug("Serving index...");
                const indexPath = "./pages/index.js";
                delete require.cache[require.resolve(indexPath)];
                await require(indexPath)(req, res);
                return;
            }
            if (url.pathname.endsWith("/"))
            {
                var dest = url.pathname;
                while (dest.endsWith("/"))
                {
                    dest = dest.substring(0, dest.length - 1);
                }
                if (dest === "")
                {
                    dest = "/";
                }
                LOG.debug(`Redirecting to: ${dest}`);
                res.writeHead(302, {'Location': dest});
                res.end();
                return;
            }
            // Attempt to serve dynamic page
            {
                const absPath = PATH.resolve(PATH.join(".", "pages", `${url.pathname}.js`));
                if (FS.existsSync(absPath) && absPath.startsWith(__dirname))
                {
                    LOG.debug("Serving dynamic page...");
                    delete require.cache[require.resolve(absPath)];
                    await require(absPath)(req, res);
                    return;
                }
            }
            // Attempt to serve static file
            {
                const absPath = PATH.resolve(PATH.join(".", "static", url.pathname));
                if (FS.existsSync(absPath) && absPath.startsWith(__dirname))
                {
                    LOG.debug("Serving static page...");
                    const stats = FS.statSync(absPath);
                    res.writeHead(200, {'Content-Type': MIME.getType(absPath), 'Content-Length': stats.size});
                    FS.createReadStream(absPath).pipe(res);
                    return;
                }
            }
            LOG.debug("Page not found...");
            res.writeHead(404, {'Content-Type':'text/html'});
            res.write(PG().html(
                    PG()
                    .h1(`Page not found: ${url.pathname}`)
                    .a("Return home", { href: "/" })
                ).finalize()
                );
            res.end();
            return;
        }
        LOG.warning(`Unsupported HTTP method (${req.method}) request recieved`)
        res.writeHead(405, {"Content-Type":"text/html"});
        res.write(PG().html(
                PG()
                .h1(`Invalid HTTP method: ${req.method}`)
            ).finalize()
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
