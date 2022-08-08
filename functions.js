const fs = require("fs");
const { MongoClient, ServerApiVersion } = require('mongodb');
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
    static generate_token(length){
        //edit the token allowed characters
        var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
        var b = [];  
        for (var i=0; i<length; i++) {
            var j = (Math.random() * (a.length-1)).toFixed(0);
            b[i] = a[j];
        }
        return b.join("");
    }
}
module.exports = functions;