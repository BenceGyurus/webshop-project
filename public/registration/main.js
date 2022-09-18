function get_Token(){
    let url = window.location.pathname.split("/");
    let token = "";
    for (let i = 2; i < url.length; i++){
        token += url[i];
    }
    return token;
}
function control_Datas(){
    let control = ["name", "mail", "password", "re_Password"];
    let datas = {};
    let error = false
    for (let i = 0; i < control.length; i++){
        document.getElementById(control[i]).value.length > 3 ? datas[control[i]] = document.getElementById(control[i]).value : error = true;
    }
    !error ? ajax("POST" ,"/admin-registration", "", JSON.stringify({user_Data : datas, token : get_Token()})) : console.log(error);
}