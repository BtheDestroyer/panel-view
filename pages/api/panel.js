const PG = require("../../pagegen.js");
const { URL } = require("url");
const QS = require("querystring");
const LOG = require("../../log.js");

module.exports = function (req, res)
{
    let url = new URL(req.url, `http://${req.headers.host}/`);
    LOG.debug("url:" + JSON.stringify(url));
    let options = QS.parse(req.query);
    LOG.debug("options:" + JSON.stringify(options));
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({
        
    }));
}
