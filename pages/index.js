const PG = require("../pagegen.js");
const { URL } = require("url");
const LOG = require("../log.js");
const CFG = require("../cfg.js").open();

module.exports = async function (req, res)
{
    const panelPath = "../panels.js";
    delete require.cache[require.resolve(panelPath)];
    const PANELS = Object.values(require(panelPath))
    .sort((a, b) => b.priority - a.priority);
    let url = new URL(req.url, `${req.protocol}://${req.headers.host}/`);
    if (url.pathname === "/index")
    {
        res.writeHead(302, {'Location': "/"});
        res.end();
        return;
    }
    res.writeHead(200, {'Content-Type':'text/html'});
    var panelsContent = PG();
    for (var panel of PANELS)
    {
        panelsContent.append(await panel.draw());
    }
    res.end(
        PG().DOCTYPE()
        .html(
            PG().head(
                PG().link({ href: "/style.css" })
                .script("", { src: "/jquery-3.6.0.min.js" })
            )
            .body(
                PG().h1(CFG.page.title || "Panel View")
                .div(
                    panelsContent,
                    { class: "panels" }
                )
                .footer(
                    (() =>
                    {
                        if (CFG.page.footer)
                        {
                            return PG().p(CFG.page.footer);
                        }
                        return PG();
                    })()
                    .p(`Made using ${PG().a("panel-view", { href: "https://github.com/bthedestroyer/panel-view" })} Copyright Bryce Dixon, &copy; 2022`)
                )
                .script("", { src: "/panel_manager.js" })
            )
        ).finalize()
    );
}