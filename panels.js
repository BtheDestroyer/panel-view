const FS = require("fs");
const PATH = require("path");
const CFG = require("./cfg.js");

module.exports = [];
for (const file of FS.readdirSync("./panels"))
{
    if (file.endsWith(".yaml"))
    {
        const path = PATH.join("./panels", file);
        console.log(path);
        const panel = CFG.open(path);
        console.log(panel);
        module.exports.push(panel);
    }
}
