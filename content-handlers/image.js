const LOG = require("../log.js");
const PG = require("../pagegen.js");

module.exports = async function(entry)
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
