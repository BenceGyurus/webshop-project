const express = require("express");
const app = express();
const path_Selector = require("./path_Selector.js");
const bodyParser = require("body-parser");
const functions = require("./functions.js");
const { MongoClient, ServerApiVersion, ObjectID } = require('mongodb');
const encryption = require("./encryption.js");
const { parseBody } = require("./functions.js");
const ObjectId = require("mongodb").ObjectID;

var users = {};
            //CONTROL LONG TOKEN//
    /*client.connect(async (err) => {
        const collection = client.db("webshop").collection("logined_Users");
        const result = await collection.findOne({token : token, ip : functions.get_Ip(req)});
        return result ? result : {error : true, message : "Nincs bejelenetkezve"};
    });
    const user = db.collection(`${result.user.mail}${result.user._id}`);*/

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
                        const user = db.collection(`${result.user.mail}${result.user._id}`);
                        for (let i = 0; i < edit_List.length; i++){
                            if (edit_List[i][0] != "stock"){
                            body[edit_List[i][0]] ? object[edit_List[i][0]] = body[edit_List[i][0]] : error = true;
                            }
                            else{
                                object.isInStock = body[edit_List[i][0]] ? true : false;
                                object[edit_List[i][0]] = body[edit_List[i][0]];
                            }
                        }
                        const d = new Date();
                        let products = await collection.findOne({_id : id});
                        let version_Id = await last_Versions.insertOne(functions.get_Backup_Products(products,result.user));
                        object.versions.push({user : {name : result.user.name, mail : result.user.mail, id : result.user._id}, date : date, version_Id : version_Id.insertedId});
                        const result2 = await collection.updateOne({_id : id}, {$set: object});
                        await user.insertOne({type_of_Activity : "edit_Product", activity : "Termék módosítva", date: d.getTime(), browser : req.headers['user-agent'], data_Base : "products", id : id,user_Id: result.user._id});
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
    console.log(parseBody(req.body));
    let token = parseBody(req.body).token;
    client.connect(async (err) => {
            const db = client.db("webshop");
            const collection = db.collection("logined_Users");
            const result = await collection.findOne({token : token, ip : functions.get_Ip(req)});
            const deleted = db.collection("deleted_Products");
            console.log(result, token);
            if (result && result.user.edit_Rule.add_Product){
            const user = db.collection(`${result.user.mail}${result.user._id}`);
            let id = ObjectId(req.params.id);
            client.connect(async (err) => {
            const collection = client.db("webshop").collection("products");
            const product = await collection.findOne({_id : id});
            if (product){
                let date = new Date().getTime();
                const d = new Date();
                product.details.deleted = {user : {name : result.user.name, id : result.user._id, mail : result.user.mail}, date : date};
                const result2 = await collection.deleteOne({_id : id});
                const result3 = await deleted.insertOne(functions.get_Delted_Product(product));
                await user.insertOne({type_of_Activity : "delete_Product", activity : "Termék törölve", date: d.getTime(), browser : req.headers['user-agent'], data_Base : "deleted_Products", id : result3.insertedId,user_Id: result.user._id});
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
        if (edit_List[i][0] != "stock"){
            new_Data[edit_List[i][0]] = body[edit_List[i][0]] ? typeof(body[edit_List[i][0]]) == "string" ? functions.xss_Resist(body[edit_List[i][0]]) : body[edit_List[i][0]] :error = true;
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
                new_Data["url"] = functions.replace_Chars(body.name).toLowerCase();
                client.connect(async (err) => {
                const db = client.db("webshop");
                const user = db.collection(`${result.user.mail}${result.user._id}`);
                const collection = db.collection("products");
                const result2 = await collection.insertOne(new_Data);
                const d = new Date();
                await user.insertOne({type_of_Activity : "add_Product", activity : "Termék hozzáadva", date: d.getTime(), browser : req.headers['user-agent'], data_Base : "products", id : result2.insertedId,user_Id: result.user._id});
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
    let rules = parseBody(req.body).rules
    console.log(token);
    const client = db.admin();
    client.connect(async (err) => {
        const collection = client.db("webshop").collection("logined_Users");
        let result = await collection.findOne({token : token, ip : functions.get_Ip(req)});
        if (result && result.user.edit_Rule.add_Editor && rules){
            client.connect(async (err) => {
                const d = new Date();
                let new_User_Token = functions.generate_token(100);
                const db = client.db("webshop")
                const collection = db.collection("links_Of_New_Users");
                const user = db.collection(`${result.user.mail}${result.user._id}`);
                result2 = await collection.insertOne({token : new_User_Token, editor : {id : result.user._id, name : result.user.name, mail : result.user.mail}, validity : d.getTime()+2592000000, rules: rules});
                console.log(result);
                await user.insertOne({type_of_Activity : "add_User", activity : "Felhasználó hozzáadva", date: d.getTime(), browser : req.headers['user-agent'], data_Base : "links_Of_New_Users", id : result2.insertedId,user_Id: result.user._id});
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

app.get("/admin-registration/:id", (req,res)=>{
    res.sendFile(`${__dirname}/public/registration/index.html`)
})

app.post("/admin-registration", (req,res)=>{
    let body = parseBody(req.body);
    let client = db.admin();
    let token = body.token;
    let error = false;
    client.connect(async (err) => {
        const db = client.db("webshop");
        const collection = db.collection("links_Of_New_Users");
        const result = await collection.findOne({token : token});
        if (result){
            console.log(result.rules);
            const admin_Users = db.collection("admins");
            let new_User = {
                name : body.user_Data.name ? body.user_Data.name : error = true,
                mail : body.user_Data.mail ? body.user_Data.mail : error = true,
                password : body.user_Data.password ? encryption(body.user_Data.password) : error = true,
                added : result.editor,
                edit_Rule : result.rules,
            }
            if (!error){
                if (!await admin_Users.findOne({mail : new_User.mail})){;
                    result3 = await admin_Users.insertOne(new_User);
                    await collection.deleteOne({token : token});
                    res.send({error : !result3.acknowledged});
                }
                else{
                    res.send({error : true, message : "Foglalt e-mail cím"});
                }
                }else{
                    res.send({error : true, message: "Helytelen adatok"});
                }
        }else{
            res.send({error : true, message:  "Nincs jogosultsága"});
        }
    });
});

app.post("/get_This_Version/:version_Id", (req,res)=>{
    let version_Id = ObjectId(req.params.version_Id);
    let token = parseBody(req.body).token;
    const client = db.admin();
    client.connect(async (err) => {
        const db = client.db("webshop")
        const collection = db.collection("logined_Users");
        const result = await collection.findOne({token : token, ip : functions.get_Ip(req)});
        if (result && result.user.edit_Rule.add_Product){
            const back_Ups = db.collection("products_Last_Versions_Backups");
            const back_Up = await back_Ups.findOne({_id : version_Id});
            back_Up ? res.send(JSON.stringify(back_Up)) : res.send(JSON.stringify({error : true, message: "Nem található"}));
        }
        else{
            res.send(JSON.stringify({error : true, message : "Nincs hozzáférés"}));
        }
    });
});

app.post("/get_This_Admin/:id", (req,res)=>{
    const client = db.admin();
    const id = new ObjectId(req.params.id);
    const token = parseBody(req.body).token;
    client.connect(async (err) => {
        const db = client.db("webshop")
        const collection = db.collection("logined_Users");
        const result = await collection.findOne({token : token, ip : functions.get_Ip(req)});
        if (result && result.user.edit_Rule.add_Editor){
            const admin = db.collection("admins");
            let admin_Data = await admin.findOne({_id : id});
            let send_Data = {};
            for (let i = 0; i < Object.keys(admin_Data).length; i++){
                Object.keys(admin_Data)[i] != "password" ? send_Data[Object.keys(admin_Data)[i]] = admin_Data[Object.keys(admin_Data)[i]] : "";
            }
            console.log(send_Data);
            res.send(send_Data);
        }
        else{
            res.send({error : true, message : "Nincs hozzáférése"});
        }
    });
});

app.post("/edit_Admin_User/:id", (req,res)=>{
    let body = parseBody(req.body);
    let id = new ObjectID(req.params.id);
    const client = db.admin();
    client.connect(async (err) => {
        const db = client.db("webshop");
        const logined_Users = db.collection("logined_Users");
        const user_Informations = await logined_Users.findOne({token : body.token, ip : functions.get_Ip(req)});
        if (user_Informations && user_Informations.user.edit_Rule.add_Editor){
            const admins = db.collection("admins");
            const user = await admins.findOne({_id : id});
            user.edit_Rule = body.data;
            let result = {modifiedCount : false};
            if (!user.cantDelete){
                result2 = await logined_Users.find().toArray();
                for (let i = 0; i < result2.length; i++){
                    //console.log(typeof(result2[i].user._id), typeof(id));
                    console.log(String(result2[i].user._id) == String(id));
                    if (String(result2[i].user._id) == String(id) && !result2[i].user.cantDelete){
                        result2[i].user.edit_Rule = body.data;
                        //console.log("user :",result[i].user.edit_Rule);
                        await logined_Users.updateOne({token : result2[i].token}, {$set: result2[i]});
                    }
                }
                result = await admins.updateOne({_id : id}, {$set : user});
            }
            result.modifiedCount ? res.send(JSON.stringify({error : false, message : "Sikeres módosítás"})) : res.send(JSON.stringify({error : true, message : "Nem történt módosítás"}));
        }
        else{
            res.send(JSON.stringify({error : true, message : "Nincs hozzáférése"}));
        }
    });
})

app.use((req,res)=>{
    if (req.method == "GET"){
    let file_Name = path_Selector(req.url);
    res.sendFile(file_Name ? file_Name : `${__dirname}/public/error/index.html`);
    }
});

app.listen(4000);