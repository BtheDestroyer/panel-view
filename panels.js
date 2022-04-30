const FS = require("fs");
const PATH = require("path");
const CFG = require("./cfg.js");
const LOG = require("./log.js");
const PG = require("./pagegen.js");
const CONTENT = require("./panel-content.js");

async function drawPanel(panel, contents)
{
    return PG().div(PG().h2(panel.title).append(contents), { class: "panel", id: panel.panel });
}

module.exports = {};
for (const file of FS.readdirSync("./panels"))
{
    if (file.endsWith(".yaml"))
    {
        const path = PATH.join("panels", file);
        const panel = file.substring(0, file.lastIndexOf("."));
        module.exports[panel] = Object.assign({ title: "Panel", contents: [], priority: 0, panel }, CFG.open(path));
        module.exports[panel].draw = async () => drawPanel(module.exports[panel], await CONTENT.drawContents(module.exports[panel].contents));
    }
    else if (file.endsWith(".js"))
    {
        const path = "./" + PATH.join("panels", file);
        const panel = file.substring(0, file.lastIndexOf("."));
        delete require.cache[require.resolve(path)];
        module.exports[panel] = Object.assign({ title: "Panel", contents: [], priority: 0, panel }, require(path));
        if (module.exports[panel].drawContents == undefined
            || typeof(module.exports[panel].drawContents) != "function")
        {
            module.exports[panel].draw = async () => drawPanel(module.exports[panel], await CONTENT.drawContents(module.exports[panel].contents));
        }
        else
        {
            module.exports[panel].draw = async () => drawPanel(module.exports[panel], await module.exports[panel].drawContents());
        }
    }
}
