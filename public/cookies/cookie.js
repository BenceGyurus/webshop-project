function parseCookies(){
    let string_Cookies = document.cookie;
    let object_Cookie = {};
    for (let i = 0; i < string_Cookies.split(";").length; i++){
        for (let k = 1; k < string_Cookies.split(";")[i].split("=").length; k++){
            object_Cookie[string_Cookies.split(";")[i].split("=")[0]] ? object_Cookie[string_Cookies.split(";")[i].split("=")[0]] +=  string_Cookies.split(";")[i].split("=")[k] : object_Cookie[string_Cookies.split(";")[i].split("=")[0]] =  string_Cookies.split(";")[i].split("=")[k]
        }
    }
    return object_Cookie;
}

function insert_Cookie(name, value){
    document.cookie += `${name}=${value}`
}

function delete_Cookie(sKey, sPath, sDomain) {
    document.cookie = encodeURIComponent(sKey) + 
                  "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + 
                  (sDomain ? "; domain=" + sDomain : "") + 
                  (sPath ? "; path=" + sPath : "");
}