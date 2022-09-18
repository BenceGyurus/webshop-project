var all_Short_Cuts = {};
var all_Access = [];
function get_Admins(){
    ajax("POST", "/admins", element_Admins, JSON.stringify({token : parseCookies().long_Token}))
}

function create_Radio_Buttons_From_Json(data){ // type of data is object like {"edit_Admin" : "admin szerkesztése"} key is id and value is title
    let html_Data = "";
    for (let i = 0; i < Object.keys(data).length; i++){
        let div = HTML.label(random_Id(), "new_Label", data[Object.keys(data)[i]], Object.keys(data)[i]);
        div += HTML.input(Object.keys(data)[i], "checkbox", Object.keys(data)[i], "checkbox");
        html_Data += HTML.div(random_Id(), "checkbox_Div", div);
        window.all_Access.push(Object.keys(data)[i]);
    }
    return html_Data;
}

function create_Short_Cuts(data){
    let labels = "";
        for (let k = 0; k < data.length; k++){
            window.all_Short_Cuts[data[k][Object.keys(data[k])[0]].id] = data[k][Object.keys(data[k])[0]].access;
            labels += HTML.input(random_Id(), "short_Cut", Object.keys(data[k])[0], "button", `shortCutThis('${data[k][Object.keys(data[k])[0]].id}')`);
        }
    return labels
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
        let labels = create_Short_Cuts(data);
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
    let html_Data = create_Radio_Buttons_From_Json(data);
    element(html_Data, "add_Accesses");
    short_Cuts();
}

function hide_New_Admin_Panel(){
    get_Element("add_Accesses").innerHTML = "";
    hide_Element("new_User_Div");
}

function element_Link(json){
    let data = JSON.parse(json); 
    hide_New_Admin_Panel();
    show_Element("link_Of_New_User");
    element(new Date(data.validity), "validity");
    add_Value(`${window.location.origin}/admin-registration/${data.token}`, "link_Input");

}

function close_Link(){
    hide_Element("link_Of_New_User");
}

function copy(){
  var copyText = document.getElementById("link_Input");
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(copyText.value);
  //message Sikeresen kimásolva
}

function get_New_User_Link(){
    let access = {};
    for (let i = 0; i < window.all_Access.length; i ++){
        access[window.all_Access[i]] = get_Element(window.all_Access[i]).checked;
    }
    ajax("POST", "/get-link-to-new-user", element_Link, JSON.stringify({token : parseCookies().long_Token, rules : access}));
}

function edit_Admin(data){
    data = JSON.parse(data);
    show_Element("edit_Profile");
    document.getElementById("name_Of_User").innerHTML = data.name;
    let req = new XMLHttpRequest();
    req.onreadystatechange = ()=>{
        if (req.status == 200 && req.readyState == 4){
            if (JSON.parse(req.responseText)){
                let access = JSON.parse(req.responseText);
                let html_Data = create_Radio_Buttons_From_Json(access)
                document.getElementById("accesses").innerHTML = html_Data;
                for (let i = 0; i < Object.keys(data.edit_Rule).length; i++){
                    data.edit_Rule[Object.keys(data.edit_Rule)[i]] ? document.getElementById(Object.keys(data.edit_Rule)[i]).checked = true : "";
                }
                if (data.added){
                    document.getElementById("user_Data").innerHTML = HTML.label(random_Id(21), "", `Hozzáadó: ${data.added.name}`);
                }
                else{
                    document.getElementById("user_Data").innerHTML = "Nincsenek megjeleníthető adatok";
                }
            }
        }
    }
    document.getElementById("save_Button").innerHTML = HTML.input(random_Id(32), "save_Button", "Mentés", "button", `get_Edit_Data('${data._id}')`)
    req.open("GET", "/get_Admin_Rules");
    req.send();
    let req2 = new XMLHttpRequest();
    req2.onreadystatechange = ()=>{
        if (req2.status == 200 && req2.readyState == 4){
            labels = create_Short_Cuts(JSON.parse(req2.responseText));
            document.getElementById("edit_Short_Cuts").innerHTML = HTML.div(random_Id(33), "short_Cuts", labels);
        }
    }
    req2.open("POST", "/shortcuts");
    req2.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req2.send(JSON.stringify({token: parseCookies().long_Token}));
}

function close_Edit_Admin(){
    document.getElementById("save_Button").innerHTML = "";
    document.getElementById("user_Data").innerHTML = "";
    hide_Element("edit_Profile");
}

function get_Edit_Data(id){
    let dic = {};
    if (window.all_Access){
    for (let i = 0; i < window.all_Access.length; i++){
        dic[window.all_Access[i]] = document.getElementById(window.all_Access[i]).checked;
    }
    ajax("POST", `/edit_Admin_User/${id}`, "", JSON.stringify({token : parseCookies().long_Token, data : dic}));
    }
    else{
        //error "Hiba történt az oldal betöltése közben"
    }
    console.log(dic, id);
}

function edit_This_Admin(id){
    console.log(window.all_Access);
    ajax("POST", `/get_This_Admin/${id}`, edit_Admin, JSON.stringify({token : parseCookies().long_Token}));
}