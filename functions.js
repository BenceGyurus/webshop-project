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
    static get_Ip(req){
        return req.headers['x-forwarded-for'] || req.socket.remoteAddress
    }

    static get_Backup_Products(product, user){
        let new_Product = {}
        for (let i = 0; i < Object.keys(product).length; i++){
            if (product[Object.keys(product)[i]]){
                Object.keys(product)[i] != "_id" && Object.keys(product)[i] != "versions" ? new_Product[Object.keys(product)[i]] = product[Object.keys(product)[i]] : "";
            }
        }
        let date = new Date().getTime();
        new_Product.details.edited = {user : {name : user.name, id : user._id, mail : user.mail}, date : date, id : this.generate_token(100)};
        return new_Product;
    }
    static get_Delted_Product(product){
        let new_Product = {};
        for (let i = 0; i < Object.keys(product).length; i++){
            Object.keys(product)[i] != "_id" ? new_Product[Object.keys(product)[i]] = product[Object.keys(product)[i]] : "";
        }
        return product;
    }
    static xss_Resist(data){
        let chars = JSON.parse(this.open_Json("/html_Symbols.json"));
        console.log(chars);
        let new_String = "";
        for (let i = 0; i < data.length; i++){
            new_String += chars[data[i]] ? "" : data[i];
        }
        return new_String;
    }
    static replace_Chars(string){
        let chars = JSON.parse(this.open_Json("/replace_Chars.json"));
        let new_String = "";
        for (let i = 0; i < string.length; i++){
            new_String += chars[string[i]] ? chars[string[i]] : string[i];
        }
        return new_String;
    }
}
module.exports = functions;