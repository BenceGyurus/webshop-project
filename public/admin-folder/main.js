function control_Long_Token(){
    if (!parseCookies().long_Token){
        window.location = "/admin-bejelentkezes";
    }
    else{
        ajax("POST", "/get-access", element_Data, JSON.stringify({token: parseCookies().long_Token}));
    }
}

function element_Data(data){
    data = JSON.parse(data);
    let lis = ""
    for (let i = 0; i < data.rules.length; i++){
        lis += HTML.li(random_Id(), "menu_Tags", data.rules[i][0], `set_Url('${data.rules[i][1]}')`)
    }
    element(HTML.ul(random_Id(), "menu_Grid", lis), "menu");
    get_This();
    let list = [["add-product", get_Products], ["editors", get_Admins]];
    for (let i = 0; i < list.length; i++){
        if (list[i][0] == window.location.pathname.split("/")[window.location.pathname.split("/").length-1]){
            list[i][1]();
        }
    }
}

function set_Url(url){
    window.location = `/admin${url}`;
}

function element_To_Conteiner(data){
    element(data, "conteiner");
}

function get_This(){
    let url = window.location.pathname;
    url = url == "/admin" ? "/basic" : `/${url.split("/")[url.split("/").length-1]}`;
    ajax("GET",url , element_To_Conteiner);
}


window.onload = control_Long_Token;