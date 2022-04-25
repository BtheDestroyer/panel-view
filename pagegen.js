module.exports = function() {
    let page = {
        content: [],
        finalize: function() { return this.content.join(""); },
        addGenerator: function(htmlTag, defaultAttributeMap = {}, hasContent = true)
        {
            if (hasContent)
            {
                this[htmlTag] = function(content = "", attributeMap = {})
                {
                    attributeMap = {...defaultAttributeMap, ...attributeMap};
                    if (Object.keys(attributeMap).length == 0)
                    {
                        this.content.push(`<${htmlTag}>${content}</${htmlTag}>`);
                    }
                    else
                    {
                        let attributeList = [];
                        for (const key in attributeMap)
                        {
                            attributeList.push(`${key}="${attributeMap[key]}"`);
                        }
                        this.content.push(`<${htmlTag} ${attributeList.join(" ")}>${content}</${htmlTag}>`)
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
                        this.content.push(`<${htmlTag} />`);
                    }
                    else
                    {
                        let attributeList = [];
                        for (const key in attributeMap)
                        {
                            attributeList.push(`${key}="${attributeMap[key]}"`);
                        }
                        this.content.push(`<${htmlTag} ${attributeList.join(" ")} />`)
                    }
                    return this;
                }
            }
            return this;
        },
    }
    .addGenerator("head")
    .addGenerator("body")
    
    .addGenerator("a", {href: undefined})
    .addGenerator("p")
    .addGenerator("b")
    .addGenerator("i")
    .addGenerator("u")
    
    .addGenerator("h1")
    .addGenerator("h2")
    .addGenerator("h3")
    .addGenerator("h4")
    .addGenerator("h5")
    
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
    
    .addGenerator("button", { type: "button" }, false)
    
    .addGenerator("colgroup", { span: undefined })
    .addGenerator("col", { width: 100});
    delete page.addGenerator;
    return page;
};
