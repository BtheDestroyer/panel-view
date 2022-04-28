const LOG = require("../log.js");
const PG = require("../pagegen.js");
const CONTENT = require("../panel-content.js");

async function appendItem(section, item)
{
    if (item.list || item.bullet)
    {
        section.append(await CONTENT.drawEntry(item));
    }
    else
    {
        section.li(await CONTENT.drawEntry(item));
    }
}

module.exports = async function(entry)
{
    var section = PG();
    if (entry.list != undefined)
    {
        LOG.debug("Drawing list");
        for (const item of entry.list)
        {
            await appendItem(section, item);
        }
        return PG().ol(section);
    }
    if (entry.bullet != undefined)
    {
        LOG.debug("Drawing bullet");
        for (const item of entry.bullet)
        {
            await appendItem(section, item);
        }
        return PG().ul(section);
    }
    return section;
}
