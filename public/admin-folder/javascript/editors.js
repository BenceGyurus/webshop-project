var all_Short_Cuts = {};
var all_Access = [];
function get_Admins(){
    ajax("POST", "/admins", element_Admins, JSON.stringify({token : parseCookies().long_Token}))
}

function element_Admins(data){
    let body = JSON.parse(JSON.parse(data).admins);
    console.log(body);
    let admin_Keys = JSON.parse(data).keys;
    let html = "";
    for (let i = 0; i < body.length; i++){
        let div_Data = HTML.h(random_Id(), "admin_Data", `Név: ${body[i].name}`, 2);
        div_Data += HTML.h(random_Id(), "admin_Data", `E-mail cím: ${body[i].mail}`, 2);
        let lis = "";
        console.log(body[i].access);
        for (let k = 0; k < Object.keys(body[i].access).length; k++){
            console.log(Object.keys(body[i].access)[k]);
            lis += Object.keys(body[i].access)[k] ? HTML.li(random_Id(), "li_Tag", admin_Keys[Object.keys(body[i].access)[k]]) : "";
        }
        div_Data += HTML.ul(random_Id(), "ul_Tag", lis);
        div_Data += HTML.input(random_Id(), "edit_Button", "Szerkesztés", "button", !body[i].cantDelete ? `edit_This_Admin('${body[i]._id}')` : "", body[i].cantDelete);
        html += HTML.div(random_Id(), "admin_User_Div", div_Data);
    }
    element(html, "admin_Users");
}

function add_New_Admin_User(){
    ajax("GET","/get_Admin_Rules",element_New_Admin_Panel);
}

function short_Cuts(){
    ajax("POST", "/shortcuts", element_Short_Cuts, JSON.stringify({token : parseCookies().long_Token}));
}

function element_Short_Cuts(data){
    if (get_Element("new_User_Div").style.display == "block"){
        data = JSON.parse(data);
        console.log(data);
        let labels = "";
        for (let k = 0; k < data.length; k++){
            window.all_Short_Cuts[data[k][Object.keys(data[k])[0]].id] = data[k][Object.keys(data[k])[0]].access;
            console.log(Object.keys(data[k])[0]);
            labels += HTML.input(random_Id(), "short_Cut", Object.keys(data[k])[0], "button", `shortCutThis('${data[k][Object.keys(data[k])[0]].id}')`);
        }
        console.log(labels);
        element(labels, "short_Cuts");
    }
}

function shortCutThis(id){
    if (window.all_Access){
        for (let i = 0; i < window.all_Access.length; i++){
            get_Element(window.all_Access[i]).checked = false;
        }
    }
    for (let i = 0; i < window.all_Short_Cuts[id].length; i++){
        get_Element(window.all_Short_Cuts[id][i]).checked = true;
    }
}

function element_New_Admin_Panel(data){
    get_Element("new_User_Div").style.display = "block";
    data = JSON.parse(data);
    window.all_Access = Object.keys(data);
    let html_Data = "";
    for (let i = 0; i < Object.keys(data).length; i++){
        let div = HTML.label(random_Id(), "new_Label", data[Object.keys(data)[i]], Object.keys(data)[i]);
        div += HTML.input(Object.keys(data)[i], "checkbox", Object.keys(data)[i], "checkbox");
        html_Data += HTML.div(random_Id(), "checkbox_Div", div);
    }
    element(html_Data, "add_Accesses");
    short_Cuts();
}

function element_Link(){

}

function get_New_User_Link(){
    ajax("POST", "/get-link-to-new-user", element_Link, JSON.stringify({token : parseCookies().long_Token}));
}