const express = require("express");
const app = express();
const path_Selector = require("./path_Selector.js");
const bodyParser = require("body-parser");
const functions = require("./functions.js");
const { MongoClient, ServerApiVersion } = require('mongodb');
const encryption = require("./encryption.js");

var users = {};

class db{
    static admin(){
        const uri = "mongodb+srv://BenceGyurus:OmTlbpYBJMJ0kxa6@cluster0.ax9leit.mongodb.net/?retryWrites=true&w=majority";
        return new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    }
}

app.get("/", (req,res)=> {
    res.sendFile(`${__dirname}/public/main/index.html`);
});

app.use(bodyParser.urlencoded({extended: true}));

app.post("/admin-login", (req,res)=>{
    let body = functions.parseBody(req.body);
    if (body){
        const client = db.admin();
        client.connect(async (err) => {
            const collection = client.db("webshop").collection("admins");
            const result = await collection.findOne({mail : body.mail, password : encryption(body.password)});
            let token;
            if (result){
                //console.log(Object.keys(result));
                let lambda = {}
                token = functions.generate_token(100);
                for (let i = 0; i < Object.keys(result).length; i++){
                    if (Object.keys(result)[i] != "password"){
                        lambda[Object.keys(result)[i]] = result[Object.keys(result)[i]];
                    }
                }
                users[token] = lambda;
                const client = db.admin();
            client.connect(async (err) => {
                const collection = client.db("logined_Users").collection("admins");
                const result = await collection.findOne({token : body.token});
        }
    );
            }
            res.send(JSON.stringify({token : result ? token : false}));
            client.close();
          });
    }
});

app.post("/get-long-token", (req,res)=>{
    let body = functions.parseBody(req.body);
    const client = db.admin();
        client.connect(async (err) => {
            const collection = client.db("logined_Users").collection("admins");
            const result = await collection.findOne({token : body.token});
        }
    );
});

app.use((req,res)=>{
    if (req.method == "GET"){
    let file_Name = path_Selector(req.url);
    res.sendFile(file_Name ? file_Name : `${__dirname}/public/error/index.html`);
    }else{
        next();
    }
});

app.listen(4000);