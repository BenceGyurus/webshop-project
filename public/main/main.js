function load(){
    ajax("GET", "/products", element_To_Products);
}

function element_To_Products(products){
    products = JSON.parse(products);
    let html = "";
    for (let i = 0; i < products.length; i++){
    div = ""
    div += HTML.img(random_Id(), "product_Image", products[i].image);
    div += HTML.label(random_Id(), "product_Name", products[i].name);
    div += HTML.label(random_Id(), "product_Price",products[i].price );
    html += HTML.div(random_Id(), "product_Grid", div);
    }
    get_Element("conteiner").innerHTML = html;
}

window.onload = load;