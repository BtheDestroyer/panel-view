const PG = require("../pagegen.js");
const { URL } = require("url");

module.exports = function (req, res)
{
    let url = new URL(req.url, `http://${req.headers.host}/`);
    if (url.pathname === "/index")
    {
        res.writeHead(302, {'Location': "/"});
        res.end();
        return;
    }
    res.writeHead(200, {'Content-Type':'text/html'});
    res.write(
        PG().html(
            PG().head(
                PG().link({ href: "/style.css" })
            )
            .body(
                PG().h1("Panel View")
                .div(
                    (() => {
                        var panels = PG();
                        for (var i = 0; i < 20; ++i)
                        {
                            var panel = PG().h2(`Panel ${i + 1} Title`);
                            for (var j = Math.floor(Math.random() * 5); j >= 0; --j)
                            {
                                panel.p("Panel content");
                            }
                            panels.div(
                                panel,
                                { class: "panel", id: `panel-${i + 1}` }
                            );
                        }
                        return panels;
                    })(),
                    { class: "panels" }
                )
                .footer(
                    PG().p(`${PG().a("panel-view", { href: "https://github.com/bthedestroyer/panel-view" })} Copyright Bryce Dixon, &copy; 2022`)
                )
            )
        ).finalize()
        );
    res.end();
}