const FS = require("fs");
const PATH = require("path");
const CFG = require("./cfg.js");
const PG = require("./pagegen.js");
const LOG = require("./log.js");
const MCSTATUS = require("./mcstatus.js");

async function drawText(entry)
{
    var section = PG();
    if (entry.text == undefined)
    {
        return section;
    }
    LOG.debug("Drawing text");
    var contents = entry.text;
    if (entry.italic)
    {
        contents = PG().i(contents);
    }
    if (entry.bold)
    {
        contents = PG().b(contents);
    }
    if (entry.underline)
    {
        contents = PG().u(contents);
    }
    if (entry.strikethrough)
    {
        contents = PG().s(contents);
    }
    if (entry.link)
    {
        contents = PG().a(contents, { href: entry.link }).finalize();
    }
    section.p(contents);
    return section;
}

async function drawImage(entry)
{
    var section = PG();
    if (entry.image == undefined)
    {
        return section;
    }
    LOG.debug("Drawing image");
    section.img({ src: entry.image });
    return section;
}

async function drawBullet(entry)
{
    var section = PG();
    if (entry.bullet == undefined)
    {
        return section;
    }
    LOG.debug("Drawing bullets");
    for (const bullet of entry.bullet)
    {
        const content = PG()
            .append(await drawText(bullet))
            .append(await drawImage(bullet))
            .append(await drawMinecraftStatus(bullet))
            .finalize();
        if (content.length > 0)
        {
            section.li(content);
        }
        section.append(await drawBullet(bullet));
    }
    return PG().ul(section);
}

async function drawMinecraftStatus(entry)
{
    var section = PG();
    if (entry["minecraft-status"] == undefined)
    {
        return section;
    }
    var status = await MCSTATUS.requestServerStatus(
        entry["minecraft-status"].host,
        entry["minecraft-status"].port
    );
    if (status.favicon)
    {
        status.favicon = PG().img({ src: status.favicon });
    }
    if (status.players && status.players.sample)
    {
        var playerList = PG();
        for (const sample of status.players.sample)
        {
            playerList.li(sample.name);
        }
        status.players.list = PG().ul(playerList).finalize();
    }
    if (status.error)
    {
        section.p(PG().b(PG().i(`Error: ${status.error}`)));
    }
    for (var entry of entry["minecraft-status"].display)
    {
        var line = entry.text;
        if (!line)
        {
            continue;
        }
        while (true)
        {
            const start = line.indexOf("{");
            const end = line.indexOf("}");
            if ((start == -1 && end == -1) || start > end)
            {
                break;
            }
            let path = line.substring(start + 1, end);
            let table = status;
            try
            {
                let subpath = path;
                while (subpath.length > 0)
                {
                    const period = subpath.indexOf(".");
                    if (period != -1)
                    {
                        table = table[subpath.substring(0, period)];
                        subpath = subpath.substring(period + 1);
                    }
                    else
                    {
                        table = table[subpath];
                        break;
                    }
                }
            }
            catch
            {
                LOG.error(`Failed to resolve path [${path}] while evaluating contents.minecraft-status.display line: ${line}`);
                table = "???";
            }
            line = `${line.substring(0, start)}${table}${line.substring(end + 1)}`;
        }
        entry.text = line
        section.append(await drawText(entry));
    }
    return section;
}

async function drawContents(contents)
{
    var page = PG();
    for (const entry of contents)
    {
        page.append(await drawText(entry));
        page.append(await drawImage(entry));
        page.append(await drawBullet(entry));
        page.append(await drawMinecraftStatus(entry));
    }
    return page;
}

async function drawPanel(panel)
{
    var page = PG().h2(panel.title);
    page.append(await drawContents(panel.contents))
    return page;
}

module.exports = {};
for (const file of FS.readdirSync("./panels"))
{
    if (file.endsWith(".yaml"))
    {
        const path = PATH.join(".", "panels", file);
        const panel = Object.assign({ title: "Panel", contents: [], priority: 0 }, CFG.open(path));
        module.exports[file.substring(0, file.lastIndexOf("."))] = panel;
        module.exports[file.substring(0, file.lastIndexOf("."))].draw = async () => drawPanel(panel);
    }
}
