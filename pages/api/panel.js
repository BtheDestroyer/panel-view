const { URL } = require("url");
const QS = require("querystring");
const PG = require("../../pagegen.js");
const LOG = require("../../log.js");

module.exports = {
    generate: async function(req)
    {
        const panelPath = "../../panels.js";
        delete require.cache[require.resolve(panelPath)];
        const PANELS = require(panelPath);
        const url = new URL(req.url, `${req.connection.encrypted ? 'https' : 'http'}://${req.headers.host}/`);
        const panelKeys = Object.keys(PANELS);
        let apiResponse = {
            _links: {
                self: {
                    href: url.href
                }
            }
        };
        apiResponse._links.count = panelKeys.length;
        if (panelKeys.length > 0)
        {
            apiResponse._links.first = {
                href: `${url.origin}${url.pathname}?panel=${panelKeys[0]}`
            };
            apiResponse._links.last = {
                href: `${url.origin}${url.pathname}?panel=${panelKeys[panelKeys.length - 1]}`
            };
        }
        if (url.searchParams.has("panel"))
        {
            const currentPanel = panelKeys.indexOf(url.searchParams.get("panel"));
            if (currentPanel != -1)
            {
                if (currentPanel + 1 < panelKeys.length)
                {
                    apiResponse._links.next = {
                        href: `${url.origin}${url.pathname}?panel=${panelKeys[currentPanel + 1]}`
                    };
                }
                if (currentPanel > 0)
                {
                    apiResponse._links.prev = {
                        href: `${url.origin}${url.pathname}?panel=${panelKeys[currentPanel - 1]}`
                    };
                }
                apiResponse.panel = Object.assign({}, PANELS[url.searchParams.get("panel")]);
                if (apiResponse.panel.secret)
                {
                    apiResponse.panel.contents = "[secret]";
                }
                apiResponse.panel.panel = url.searchParams.get("panel");
            }
            else
            {
                apiResponse.error = {
                    what: "Failed to get requested panel",
                    why: `'${url.searchParams.get("panel")}' is not a valid panel`
                };
            }
        }
        return JSON.stringify(apiResponse);
    },
    serve: async function (req, res)
    {
        res.writeHead(200, {'Content-Type':'application/hal+json'});
        res.end(this.generate(req));
    }
}
