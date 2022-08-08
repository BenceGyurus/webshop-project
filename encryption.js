const fs = require("fs");
function encryption(string){
    //string = convert(string);
    let list = string.split('');
    let new_String = "";
    for (let i  = 0; i < list.length; i++){
        let x = list[i].charCodeAt(0);
        new_String += Math.floor(Math.sin(x**(-1*Math.E))*123456789123456789123);
    }
    return new_String;
}


module.exports = encryption;
