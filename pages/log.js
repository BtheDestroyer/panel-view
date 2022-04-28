const PG = require("../pagegen.js");

module.exports = async function(req, res)
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
    res.write(PG().html(
        PG().body(
            PG().h1('panel-view log')
            .ul(list.finalize())
            )
        ).finalize()
        );
    res.end();
}