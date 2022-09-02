const express = require("express");
const app = express();
const path_Selector = require("./path_Selector.js");
const bodyParser = require("body-parser");
const functions = require("./functions.js");
const { MongoClient, ServerApiVersion } = require('mongodb');
const encryption = require("./encryption.js");
const { parseBody } = require("./functions.js");
const ObjectId = require("mongodb").ObjectID;

var users = {};
            //CONTROL LONG TOKEN//
    /*client.connect(async (err) => {
        const collection = client.db("webshop").collection("logined_Users");
        const result = await collection.findOne({token : token, ip : functions.get_Ip(req)});
        return result ? result : {error : true, message : "Nincs bejelenetkezve"};
    });*/

class db{
    static admin(){
        const uri = "mongodb+srv://BenceGyurus:OmTlbpYBJMJ0kxa6@cluster0.ax9leit.mongodb.net/?retryWrites=true&w=majority";
        return new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    }
}

app.get("/", (req,res)=> {
    res.sendFile(`${__dirname}/public/main/index.html`);
});

app.use(bodyParser.urlencoded({extended: false}));

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
            if (users[body.token]){
                let new_Token = functions.generate_token(250);
                const collection = client.db("webshop").collection("logined_Users");
                const result = await collection.insertOne({token : new_Token, ip : functions.get_Ip(req), user : users[body.token]});
                res.send(result ? JSON.stringify({message:"Sikeres bejelenetkezés", error : false, token : new_Token}) : JSON.stringify({message: "Sikertelen bejelentkezés", error : true}));
            }
            else{
                res.send(JSON.stringify({error: true, message: "Helytelen token"}));
            }
            
            delete users[body.token];
        }
    );
});

app.post("/get-access", (req,res)=>{
    let body = functions.parseBody(req.body);
    let client = db.admin();
    if (body.token){
        client.connect(async (err) => {
            const collection = client.db("webshop").collection("logined_Users");
            const result = await collection.findOne({token : body.token, ip : functions.get_Ip(req)});
            let send_Object = {};
            if (result){
                let rules = JSON.parse(functions.open_Json("rules_Hu.json"));
                console.log(rules);
                let list = []
                for (let i = 0; i < Object.keys(result.user.edit_Rule).length; i++){
                    result.user.edit_Rule[Object.keys(result.user.edit_Rule)[i]] ? rules[Object.keys(result.user.edit_Rule)[i]] ? list.push(rules[Object.keys(result.user.edit_Rule)[i]]) : "" : "";
                }
                send_Object = {rules : list}
            }else{
                send_Object = {error : true, message : "Helytelen token vagy ip cím"};
            }
            res.send(JSON.stringify(send_Object));
    })
    }
});

app.get("/products", (req,res)=>{
    let client = db.admin();
    client.connect(async (err) => {
        const collection = client.db("webshop").collection("products");
        const result = await collection.find().toArray();
        res.send(result ? result : {error : true, message : "Hiba történt az adatbázis lekérdezése közben"});
    });
})

app.get("/admin/:url", (req,res)=>{
    res.sendFile(`${__dirname}/public/admin-folder/index.html`);
});

app.put("/edit_Products/:id", (req,res)=>{
    let body = parseBody(req.body);
    let token = body.token;
    let id = ObjectId(req.params.id);
    let edit_List = JSON.parse(functions.open_Json("/public/admin-folder/product_Edit.json")).data;
    const client = db.admin();
    client.connect(async (err) => {
        const collection = client.db("webshop").collection("logined_Users");
        const result = await collection.findOne({token : token, ip : functions.get_Ip(req)});
        if (result.user.edit_Rule.add_Product){
            let object = {};
            let error = false;
            if (!error){
                client.connect(async (err) => {
                    let date = new Date().getTime();
                    const db = client.db("webshop")
                    const collection = db.collection("products");
                    last_Versions = db.collection("products_Last_Versions_Backups");
                    let object = await collection.findOne({_id : id});
                    if (object){
                        for (let i = 0; i < edit_List.length; i++){
                            if (edit_List[i][0] != "stock"){
                            body[edit_List[i][0]] ? object[edit_List[i][0]] = body[edit_List[i][0]] : error = true;
                            }
                            else{
                                object.isInStock = body[edit_List[i][0]] ? true : false;
                                object[edit_List[i][0]] = body[edit_List[i][0]];
                            }
                        }
                        let products = await collection.findOne({_id : id});
                        let version_Id = await last_Versions.insertOne(functions.get_Backup_Products(products,result.user));
                        object.versions.push({user : {name : result.user.name, mail : result.user.mail, id : result.user._id}, date : date, version_Id : version_Id.insertedId});
                        const result2 = await collection.updateOne({_id : id}, {$set: object});
                        res.send({error : false, message: "Sikeres módosítás"});
                    }
                });
            }
            else{
                res.send({error : true, message: "Kérem adjon meg minden adatot"});
            }
        }
        else{
            res.send({error : true, message: "Nincs hozzáférése"});
        }
    });
});

app.delete("/edit_Products/:id", (req,res)=>{
    const client = db.admin();
    let token = parseBody(req.body).token;
    client.connect(async (err) => {
            const db = client.db("webshop");
            const collection = db.collection("logined_Users");
            const result = await collection.findOne({token : token, ip : functions.get_Ip(req)});
            const deleted = db.collection("deleted_Products");
            if (result && result.user.edit_Rule.add_Product){
            let id = ObjectId(req.params.id);
            client.connect(async (err) => {
            const collection = client.db("webshop").collection("products");
            const product = await collection.findOne({_id : id});
            if (product){
                let date = new Date().getTime();
                product.details.deleted = {user : {name : result.user.name, id : result.user._id, mail : result.user.mail}, date : date};
                const result2 = await collection.deleteOne({_id : id});
                const result3 = await deleted.insertOne(functions.get_Delted_Product(product));
                console.log(result2);

            }
            res.send(JSON.stringify({error : false, message: "Adatok mentése sikeres"}));
            });
            }
            else{
                res.send(JSON.stringify({error : true, message: "Nincs jogosultsága"}))
            }
    });
    });

app.post("/edit_Products", (req,res)=>{
    let body = parseBody(req.body);
    console.log(body);
    let token = body.token;
    console.log(token);
    let edit_List = JSON.parse(functions.open_Json("public/admin-folder/product_Edit.json")).data;
    let new_Data = {};
    let error = false;
    for (let i = 0; i < edit_List.length; i++){
        console.log(body[edit_List[i][0]]);
        if (edit_List[i][0] != "stock"){
            body[edit_List[i][0]]? new_Data[edit_List[i][0]] = body[edit_List[i][0]] : error = true;
        }
        else{
            new_Data[edit_List[i][0]] = body[edit_List[i][0]] ? body[edit_List[i][0]] : 0;
        }
    }
    if (!error){
        new_Data.isInStock = new_Data.stock ? true : false;
        const client = db.admin();
        client.connect(async (err) => {
            const collection = client.db("webshop").collection("logined_Users");
            const result = await collection.findOne({token : token, ip : functions.get_Ip(req)});
            if (result && result.user.edit_Rule.add_Product){
                let date = new Date().getTime();
                new_Data.details = {added : {name : result.user.name, mail : result.user.mail, id : result.user._id}, added_Date : date, edited : false, deleted : false, public : false};
                new_Data.versions = [];
                client.connect(async (err) => {
                const collection = client.db("webshop").collection("products");
                const result = await collection.insertOne(new_Data);
                res.send(JSON.stringify({error : false, message: "Adatok mentése sikeres"}));
            });
    }
    else{
        res.send(JSON.stringify({error : true, message: "Nincs hozzáférése"}));
    }
    });
    }else{
        res.send(JSON.stringify({error : true, message : "Helytelen adatok"}));
    }
});

app.post("/admins", (req,res) =>{
    token = parseBody(req.body).token;
    const client = db.admin();
    let send_Object = [];
    client.connect(async (err) => {
        const collection = client.db("webshop").collection("logined_Users");
        const result = await collection.findOne({token : token, ip : functions.get_Ip(req)});
        if (result.user.edit_Rule.add_Editor){
            client.connect(async (err) => {
                const collection = client.db("webshop").collection("admins");
                const result = await collection.find().toArray();
                for (let i = 0; i < result.length; i++){
                    send_Object.push({
                        mail: result[i].mail,
                        access : result[i].edit_Rule,
                        cantDelete : result[i].cantDelete ? true : false,
                        _id : !result[i].cantDelete ? result[i]._id : false,
                        name : result[i].name
                    });
                }
                res.send(JSON.stringify({admins : JSON.stringify(send_Object), keys : JSON.parse(functions.open_Json("/admin_Keys.json"))}));
            });
        }
        else{
            res.send({error : false, message : "Nincs hozzáférése"})
        }
    });
});

app.post("/shortcuts", (req,res)=>{
    let token = parseBody(req.body).token;
    const client = db.admin();
    client.connect(async (err) => {
        const collection = client.db("webshop").collection("logined_Users");
        const result = await collection.findOne({token : token, ip : functions.get_Ip(req)});
        let new_Array = [];
        if (result && result.user.edit_Rule.add_Editor){
            client.connect(async (err) => {
                const collection = client.db("webshop").collection("short_Cuts");
                const result = await collection.find().toArray();
                for (let i = 0; i < result.length; i++){
                    let object = {};
                    for (let k = 0; k < Object.keys(result[i]).length; k++){
                        console.log(Object.keys(result[i])[k]);
                        if (Object.keys(result[i])[k] != "_id"){
                            object[Object.keys(result[i])[k]] = result[i][Object.keys(result[i])[k]];
                            new_Array.push(object);
                        }
                    }
                }
                new_Array ? res.send(new_Array) : res.send({error : true, message : "Hiba történt az oldal betöltése közben"});
            });
        }
        else{
            res.send({error : true, message : "Nincs hozzáférése"});
        }
    });

})

app.post("/get-link-to-new-user", (req,res)=>{
    let token = parseBody(req.body).token;
    console.log(token);
    const client = db.admin();
    client.connect(async (err) => {
        const collection = client.db("webshop").collection("logined_Users");
        let result = await collection.findOne({token : token, ip : functions.get_Ip(req)});
        if (result && result.user.edit_Rule.add_Editor){
            client.connect(async (err) => {
                const d = new Date();
                let new_User_Token = functions.generate_token(100);
                const collection = client.db("webshop").collection("links_Of_New_Users");
                result2 = await collection.insertOne({token : new_User_Token, editor : {id : result.user._id, name : result.user.name, mail : result.user.mail}, validity : d.getTime()+2592000000});
                result2.acknowledged ? res.send({token : new_User_Token, validity : d.getTime()+2592000000}) : res.send({error : true, message : "Hiba történt az adatok mentése közben"});
                ;
            });
        }else{
            res.send({error : true, message : "Nincs hozzáférése"});
        }
    });
})

app.get("/get_Admin_Rules", (req,res)=>{
    res.sendFile(`${__dirname}/admin_Keys.json`);
});

app.use((req,res)=>{
    if (req.method == "GET"){
    let file_Name = path_Selector(req.url);
    res.sendFile(file_Name ? file_Name : `${__dirname}/public/error/index.html`);
    }
});

app.listen(4000);