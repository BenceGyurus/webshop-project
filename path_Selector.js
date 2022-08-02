const functions = require("./functions.js");
function select_Path(url){
    let paths = functions.open_Json("path.json") ? JSON.parse(functions.open_Json("path.json")) : "";
    if (paths){
        return url.split(".").length > 1 ? `${__dirname}/public${url}` : paths[url] ? `${__dirname}/public${paths[url]}` : false;
    }else{
        return false;
    }
}

module.exports = select_Path;