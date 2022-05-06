const { prototype } = require("events");
const FS = require("fs");
const PATH = require("path");
const CFG = require("./cfg.js").open();
const LOG = require("./log.js");

async function getFiles(dir)
{
    const dirents = await FS.promises.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) =>
    {
        const res = PATH.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
    }));
    return Array.prototype.concat(...files);
}

async function generate()
{
    LOG.info(`Generating static page...`);
    FS.mkdirSync(CFG["generate-static-pages"]["export-dir"], { recursive: true });
    const pages = await getFiles("./pages");
    LOG.info(`Found ${pages.length} pages to generate`);
    for (const page of pages)
    {
        const exported = `${page
            .substring(0, page.length - 3)
            .replace("/pages/", `/${CFG["generate-static-pages"]["export-dir"]}/`)
            .replace("\\pages\\", `\\${CFG["generate-static-pages"]["export-dir"]}\\`)}.html`;
        if (page.endsWith(".js"))
        {
            LOG.info(`Generating static page for file: ${page}`);
            delete require.cache[require.resolve(page)];
            try
            {
                const content = await require(page).generate();
                FS.writeFileSync(exported, content);
            }
            catch (e)
            {
                LOG.info(`${e}`);
            }
            continue;
        }
        LOG.error(`Couldn't generate static page for file: ${page}`);
    }
    LOG.info(`All done!`);
}

generate();
