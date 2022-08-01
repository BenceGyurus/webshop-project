function login_Callback(data){

}

function login(){
    if (document.getElementById("mail").value.length > 2 && document.getElementById("password").value.length > 2){
        ajax("POST", "/admin-login", login_Callback, JSON.stringify({mail : document.getElementById("mail").value, password: document.getElementById("password").value}));
    }
}