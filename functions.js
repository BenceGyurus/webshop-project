const fs = require("fs");
class functions{
    static open_Json(file_Name){
        try{
            return fs.readFileSync(`${__dirname}/${file_Name}`);
        }
        catch{
            return false;
        }
    }
    static parseBody(body){
        try {
            return JSON.parse(Object.keys(body)[0]);   
        } catch{
            return body;            
        }
    }
}
module.exports = functions;