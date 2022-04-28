module.exports = function() {
    let page = {
        content: [],
        finalize: function() { return this.content.join(""); },
        toString: function() { return this.finalize(``); },
        addGenerator: function(htmlTag, defaultAttributeMap = {}, hasContent = true)
        {
            if (hasContent)
            {
                this[htmlTag] = function(content = "", attributeMap = {})
                {
                    attributeMap = {...defaultAttributeMap, ...attributeMap};
                    if (Object.keys(attributeMap).length == 0)
                    {
                        this.append(`<${htmlTag}>${content}</${htmlTag}>`);
                    }
                    else
                    {
                        let attributeList = [];
                        for (const key in attributeMap)
                        {
                            attributeList.push(`${key}="${attributeMap[key]}"`);
                        }
                        this.append(`<${htmlTag} ${attributeList.join(" ")}>${content}</${htmlTag}>`)
                    }
                    return this;
                }
            }
            else
            {
                this[htmlTag] = function(attributeMap)
                {
                    attributeMap = {...defaultAttributeMap, ...attributeMap};
                    if (Object.keys(attributeMap).length == 0)
                    {
                        this.append(`<${htmlTag} />`);
                    }
                    else
                    {
                        let attributeList = [];
                        for (const key in attributeMap)
                        {
                            attributeList.push(`${key}="${attributeMap[key]}"`);
                        }
                        this.append(`<${htmlTag} ${attributeList.join(" ")} />`)
                    }
                    return this;
                }
            }
            return this;
        },
        append: function(element)
        {
            if (typeof(element) != "string")
            {
                element = `${element}`;
            }
            if (element.length > 0)
            {
                this.content.push(element);
            }
            return this;
        },
        appendTag: function(tag, content = undefined, attributeMap = {})
        {
            if (Object.keys(attributeMap).length == 0)
            {
                if (content == undefined)
                {
                    this.append(`<${htmlTag} />`);
                }
                else
                {
                    this.append(`<${htmlTag}>${content}</${htmlTag}>`);
                }
            }
            else
            {
                let attributeList = [];
                for (const key in attributeMap)
                {
                    attributeList.push(`${key}="${attributeMap[key]}"`);
                }
                if (content == undefined)
                {
                    this.append(`<${htmlTag} ${attributeList.join(" ")} />`)
                }
                else
                {
                    this.append(`<${htmlTag} ${attributeList.join(" ")}>${content}</${htmlTag}>`)
                }
            }
            return this;
        },
        DOCTYPE: function(doctype = "html")
        {
            this.append(`<!DOCTYPE ${doctype}>`);
            return this;
        }
    }
    .addGenerator("html")
    .addGenerator("head")
    .addGenerator("body")
    .addGenerator("header")
    .addGenerator("footer")

    .addGenerator("style")
    .addGenerator("script")
    .addGenerator("noscript")
    
    .addGenerator("a", {href: undefined})
    .addGenerator("p")
    .addGenerator("b")
    .addGenerator("i")
    .addGenerator("u")
    .addGenerator("s")
    .addGenerator("sub")
    .addGenerator("sup")
    .addGenerator("pre")
    .addGenerator("code")
    
    .addGenerator("h1")
    .addGenerator("h2")
    .addGenerator("h3")
    .addGenerator("h4")
    .addGenerator("h5")
    .addGenerator("h6")
    
    .addGenerator("ol")
    .addGenerator("ul")
    .addGenerator("li")
    
    .addGenerator("table")
    .addGenerator("tr")
    .addGenerator("th")
    .addGenerator("td")
    
    .addGenerator("div")
    .addGenerator("span")
    
    .addGenerator("img", { src: undefined }, false)
    .addGenerator("br", {}, false)
    .addGenerator("hr", {}, false)
    .addGenerator("link", { rel: "stylesheet", type: "text/css", href: undefined }, false)
    
    .addGenerator("form", { action: undefined, method: "post" }, false)
    .addGenerator("input", { type: "text", name: undefined })
    .addGenerator("textarea", { rows: 5, cols: 40, name: undefined })
    .addGenerator("button", { type: "button", value: undefined }, false)
    
    .addGenerator("colgroup", { span: undefined })
    .addGenerator("col", { width: 100});
    delete page.addGenerator;
    return page;
};
