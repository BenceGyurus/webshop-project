function login_Callback(data){
    data = JSON.parse(data);
    if (data.token){
        ajax("POST", "/get-long-token", create_Long_Token_Cookie, JSON.stringify({token : data.token}));
    }
}


function create_Long_Token_Cookie(data){
    data = JSON.parse(data);
    if (!data.error){
        insert_Cookie("long_Token", data.token);
        window.location = "/admin";
    }
    else{
        //natification error "Váratlan hiba történet kérem próbálja meg később!"
    }
}

function add_Cookie(data){
    data = JSON.parse(data);
    if (data.token){
    insert_Cookie("long_token", data.token);
    }
    else{
        //natification error "Helytelen felhasználónév vagy jelszó"
    }
}

function login(){
    if (document.getElementById("mail").value.length > 2 && document.getElementById("password").value.length > 2){
        ajax("POST", "/admin-login", login_Callback, JSON.stringify({mail : document.getElementById("mail").value, password: document.getElementById("password").value}));
    }
    else{
        //natification error "Kérem töltsön ki minden mezőt!"
    }
}