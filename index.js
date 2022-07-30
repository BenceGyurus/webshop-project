const express = require("express");
const app = express();

app.get("/", (req,res)=> {
    console.log(req.url);
    res.sendFile(`${__dirname}/public/main/index.html`);
})

app.listen(8000);