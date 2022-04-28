const LOG = require("../log.js");
const PG = require("../pagegen.js");

module.exports = async function(entry)
{
    var section = PG();
    if (entry.horizontalrule)
    {
        section.hr();
    }
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
