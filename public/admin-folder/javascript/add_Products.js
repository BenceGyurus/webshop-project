var products = {};
var object_Products = {};
var edit_List = [];
var selected_Id = "";

function get_Products(){
    ajax("GET", "/products", global_Products);
}


function global_Products(data){
    window.products = JSON.parse(data);
    ajax("GET", "/product_Edit", generate_Products_In_Html);
}

function generate_Products_In_Html(data){
    window.object_Products = {};
    close_Edit_Panel();
    data = JSON.parse(data).data;
    window.edit_List = data;
    let html = "";
    for (let i = 0; i < window.products.length; i++){
        let labels = ""
        for (let k = 0; k < data.length; k++){
            if (data[k][2] != "image"){
                labels += HTML.label(random_Id(), "product_Label", `${data[k][1]}: ${window.products[i][data[k][0]]}<br />`);
            }
            else{
                labels += HTML.img(random_Id(), "product_Image", window.products[i][data[k][0]]);
            }
        }
        product_Id = random_Id(100);
        window.object_Products[product_Id] = window.products[i];
        labels += HTML.input(random_Id(), "edit_Button", "Szerkesztés", "button", `edit_This('${product_Id}')`);
        labels += HTML.input(random_Id(), "delet_Button", "Törlés", "button", `delete_This('${product_Id}')`);
        html += HTML.div(product_Id, "product_Grid", labels);
    }
    delete window.products
    element(html,"products");
}


function Bool(x){
    return x == "true" ? true : false;
}

function edit(){
    if (window.selected_Id){
    let lambda = window.object_Products[window.selected_Id];
    let error = false;
    for (let i = 0; i < window.edit_List.length; i++){
        !get_Value(window.edit_List[i][0]) ? error = true : "";
        lambda[window.edit_List[i][0]] = window.edit_List[i][2] == "n" ? Number(get_Value(window.edit_List[i][0])) : window.edit_List[i][2] == "b" ? Bool(get_Value(window.edit_List[i][0])) : get_Value(window.edit_List[i][0]);
    }
    if (!error){
        lambda.token = parseCookies().long_Token;
        ajax("PUT", `/edit_Products/${window.object_Products[window.selected_Id]._id}`, get_Products, JSON.stringify(lambda));
    }else{
        //error "Adja meg az összes adatot"
    }
    console.log(lambda);
    }
    else{
        show_Element("edit_Panel");
        let object = {token : parseCookies().long_Token};
        error = false;
        for (let i = 0; i < window.edit_List.length; i++){
            !get_Value(window.edit_List[i][0]) ? error = true : "";
            object[window.edit_List[i][0]] = window.edit_List[i][2] == "n" ? Number(get_Value(window.edit_List[i][0])) : window.edit_List[i][2] == "b" ? Bool(get_Value(window.edit_List[i][0])) : get_Value(window.edit_List[i][0]);
        }
        if (!error){
            ajax("POST","/edit_Products",get_Products,JSON.stringify(object));
        }else{
            //error "Adja meg az összes adatot"
        }
    }
}

function show_Edit_Panel(){
    show_Element("edit_Panel");
    for (let i = 0; i < window.edit_List.length; i++){
        add_Value("", window.edit_List[i][0]);
    }
}

function load_Old_Version(product){
    show_Element("edit_Panel");
    try{product = JSON.parse(product);}catch{}
    if (window.edit_List){
        for (let i = 0; i < window.edit_List.length; i++){
            add_Value(product[window.edit_List[i][0]], window.edit_List[i][0]);
        }
        reset_Color_Of_Borders();
        get_Element(product_Id).style.border = "1px solid blue";
        }
        else{
            //error "Hiba történt az oldal betöltésekor"
        }
}


function reset_Color_Of_Borders(){
    for (let i = 0; i < Object.keys(window.object_Products).length; i++){
        get_Element(Object.keys(window.object_Products)[i]).style.border = "1px solid black";
    }
}

function load_Edit_Panel(product){
    show_Element("edit_Panel");
    try{product = JSON.parse(product);}catch{}
    if (window.edit_List){
        for (let i = 0; i < window.edit_List.length; i++){
            add_Value(product[window.edit_List[i][0]], window.edit_List[i][0]);
        }
        let html = `<option name = "default" value = "default" id = "default">Jelenlegi verzió</option>`;
        for (let i = product.versions.length-1; i > 0; i--){
            html += `<option name = "${product.versions[i].version_Id}" value = "${product.versions[i].version_Id}" id = "${product.versions[i].version_Id}">${new Date(product.versions[i].date)}</option>`
        }
        console.log(html);
        let select = document.getElementById("versions");
        select.addEventListener("change", ()=>{
            select.value != "default" ? ajax("POST", `/get_This_Version/${select.value}`, load_Old_Version, JSON.stringify({token : parseCookies().long_Token})) : load_Edit_Panel(window.object_Products[window.selected_Id]);
        });
        show_Element("versions");
        html ? document.getElementById("versions").innerHTML = html : "";
        reset_Color_Of_Borders();
        get_Element(product_Id).style.border = "1px solid blue";
        }
        else{
            //error "Hiba történt az oldal betöltésekor"
        }
}

function edit_This(product_Id){
    window.selected_Id = product_Id;
    load_Edit_Panel(window.object_Products[window.selected_Id]);
}

function close_Edit_Panel(){
    window.selected_Id = "";
    if (get_Element("edit_Panel").style.display != "none"){
    hide_Element("versions");
    hide_Element("edit_Panel");
    reset_Color_Of_Borders();
    }
}

function delete_This(id){
    ajax("DELETE", `/edit_Products/${window.object_Products[id]._id}`, get_Products, JSON.stringify({product : window.object_Products[id], token : parseCookies().long_Token}));
}

function load_Data(){

}