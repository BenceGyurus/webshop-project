const express = require("express");
const app = express();
const path_Selector = require("./path_Selector.js");
const bodyParser = require("body-parser");
const functions = require("./functions.js");
app.get("/", (req,res)=> {
    console.log(req.url);
    res.sendFile(`${__dirname}/public/main/index.html`);
});

app.use(bodyParser.urlencoded({extended: true}));

app.post("/admin-login", (req,res)=>{
    res.send(functions.parseBody(req.body));
})

app.use((req,res)=>{
    if (req.method == "GET"){
    let file_Name = path_Selector(req.url);
    res.sendFile(file_Name ? file_Name : `${__dirname}/public/error/index.html`);
    }else{
        next();
    }
});

app.listen(8000);