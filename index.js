const express = require("express");
const app = express();
//const path_Selector = require("./path_Selector.js");
const bodyParser = require("body-parser");
//const functions = require("./functions.js");

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


function select_Path(url){
    let paths = functions.open_Json("path.json") ? JSON.parse(functions.open_Json("path.json")) : "";
    if (paths){
        return url.split(".").length > 1 ? `${__dirname}/public${url}` : paths[url] ? `${__dirname}/public${paths[url]}` : false;
    }else{
        return false;
    }
}

app.get("/", (req,res)=> {
    res.sendFile(`${__dirname}/public/main/index.html`);
});

app.use(bodyParser.urlencoded({extended: true}));

app.post("/admin-login", (req,res)=>{
    res.send(functions.parseBody(req.body));
})

app.use((req,res)=>{
    if (req.method == "GET"){
    let file_Name = select_Path(req.url);
    res.sendFile(file_Name ? file_Name : `${__dirname}/public/error/index.html`);
    }else{
        next();
    }
});

app.listen(4000);