const CFG_PATH = "./config.yaml";
const YAML = require("yaml");
const FS = require("fs");
module.exports = {
    open: function(path = CFG_PATH) {
        const file = FS.readFileSync(path, "utf-8");
        return YAML.parse(file);
    }
};
