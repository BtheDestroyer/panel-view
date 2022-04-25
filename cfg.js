const CFG_PATH = "./config.yaml";
const YAML = require("yaml");
const FS = require("fs");
const CFG_FILE = FS.readFileSync(CFG_PATH, "utf-8");
module.exports = {
    open: function(path = CFG_FILE) {
        return YAML.parse(path);
    }
};
