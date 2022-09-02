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


function reset_Color_Of_Borders(){
    for (let i = 0; i < Object.keys(window.object_Products).length; i++){
        get_Element(Object.keys(window.object_Products)[i]).style.border = "1px solid black";
    }
}

function edit_This(product_Id){
    window.selected_Id = product_Id;
    show_Element("edit_Panel");
    if (window.edit_List){
        for (let i = 0; i < window.edit_List.length; i++){
            console.log(window.edit_List[i][0]);
            add_Value(window.object_Products[product_Id][window.edit_List[i][0]], window.edit_List[i][0]);
        }
        reset_Color_Of_Borders();
        get_Element(product_Id).style.border = "1px solid blue";
    }else{
        //ERROR "Hiba történt az oldal betöltése közben"
    }
}

function close_Edit_Panel(){
    if (get_Element("edit_Panel").style.display != "none"){
    hide_Element("edit_Panel");
    reset_Color_Of_Borders();
    }
}

function delete_This(id){
    ajax("DELETE", `/edit_Products/${window.object_Products[id]._id}`, get_Products, JSON.stringify({product : window.object_Products[id], token : parseCookies().long_Token}));
}

function load_Data(){

}