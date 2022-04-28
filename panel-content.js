const FS = require("fs");
const PATH = require("path");
const LOG = require("./log.js");
const PG = require("./pagegen.js");

module.exports = {
    handlers: [],
    drawEntry: async function (entry)
    {
        var page = PG();
        for (const handler of this.handlers)
        {
            page.append(await handler(entry));
        }
        return page;
    },
    drawContents: async function (contents)
    {
        var page = PG();
        for (const entry of contents)
        {
            page.append(await this.drawEntry(entry));
        }
        return page;
    }
};

LOG.info("Loading content handlers...")
for (const file of FS.readdirSync("./content-handlers"))
{
    if (file.endsWith(".js"))
    {
        const path = PATH.join("content-handlers", file);
        LOG.info(`  + ${path}`);
        module.exports.handlers.push(require(`./${path}`));
    }
}
LOG.info(`Loaded ${module.exports.handlers.length} content handlers`)
